import { defineStore } from "pinia";
import { ref } from "vue";
import { userAPI } from "../api";
import { usersDB } from "../db/index";
import { auth } from "../firebase/config";
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";

export const useUserStore = defineStore("user", () => {
  const dailyGoal = ref(parseInt(localStorage.getItem("dailyGoal")) || 50);
  const userData = ref(null);
  const loading = ref(false);
  const syncStatus = ref("synced");

  let unsubscribeUser = null;

  // ========== Загрузка из IndexedDB ==========
  const loadFromIndexedDB = async (userId) => {
    if (!userId) return null;

    try {
      const user = await usersDB.get(userId);
      if (user) {
        console.log("Пользователь загружен из IndexedDB");
        return user;
      }
    } catch (error) {
      console.error("Ошибка загрузки из IndexedDB:", error);
    }
    return null;
  };

  // ========== Синхронизация ==========
  const initUserSync = async (userId) => {
    if (!userId) return;

    // Очищаем предыдущую подписку
    if (unsubscribeUser) {
      unsubscribeUser();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      // Сначала загружаем из кэша
      const cached = await loadFromIndexedDB(userId);
      if (cached) {
        userData.value = cached;
        if (cached.dailyGoal) {
          dailyGoal.value = cached.dailyGoal;
          localStorage.setItem("dailyGoal", cached.dailyGoal);
        }
      }

      // Подписываемся на реальные данные
      unsubscribeUser = userAPI.subscribe(
        userId,
        async (fetchedUser) => {
          userData.value = fetchedUser;

          if (fetchedUser.dailyGoal) {
            dailyGoal.value = fetchedUser.dailyGoal;
            localStorage.setItem("dailyGoal", fetchedUser.dailyGoal);
          }

          loading.value = false;
        },
        (err) => {
          console.error("User sync error:", err);
          syncStatus.value = "error";
          loading.value = false;
        },
      );
    } catch (err) {
      console.error("Init user sync error:", err);
      loading.value = false;
    }
  };

  const cleanup = () => {
    if (unsubscribeUser) {
      unsubscribeUser();
      unsubscribeUser = null;
    }
    userData.value = null;
  };

  // ========== Обновление профиля ==========
  const updateAvatar = async (avatarBase64, originalAvatarBase64 = null) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      const updates = {
        avatar: avatarBase64,
      };

      if (originalAvatarBase64 !== undefined) {
        updates.originalAvatar = originalAvatarBase64;
      }

      await userAPI.updateProfile(updates);

      // Также сохраняем в локальном userData
      if (userData.value) {
        userData.value.avatar = avatarBase64;
        if (originalAvatarBase64 !== undefined) {
          userData.value.originalAvatar = originalAvatarBase64;
        }
        userData.value.updatedAt = new Date();
      }

      // Обновляем в IndexedDB
      await usersDB.update(user.uid, updates);

      return true;
    } catch (err) {
      console.error("Update avatar error:", err);
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      if (updates.displayName) {
        await firebaseUpdateProfile(user, { displayName: updates.displayName });
      }

      await userAPI.updateProfile(updates);

      // Обновляем локальные данные
      if (userData.value) {
        userData.value = {
          ...userData.value,
          ...updates,
          updatedAt: new Date(),
        };
      }

      // Обновляем в IndexedDB
      await usersDB.update(user.uid, updates);

      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  };

  // ========== Настройки ==========
  const setDailyGoal = async (goal) => {
    dailyGoal.value = goal;
    localStorage.setItem("dailyGoal", goal);

    const user = auth.currentUser;
    if (user) {
      await userAPI.updateProfile({ dailyGoal: goal });
    }
  };

  return {
    dailyGoal,
    userData,
    loading,
    syncStatus,
    initUserSync,
    updateAvatar,
    updateProfile,
    setDailyGoal,
    loadFromIndexedDB,
    cleanup,
  };
});
