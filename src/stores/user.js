import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export const useUserStore = defineStore("user", () => {
  const dailyGoal = ref(parseInt(localStorage.getItem("dailyGoal")) || 50);
  const userData = ref(null);
  const loading = ref(false);
  const syncStatus = ref("synced");

  let unsubscribeUser = null;

  // Инициализация синхронизации пользовательских данных
  const initUserSync = (userId) => {
    if (!userId) return;

    // Очищаем предыдущую подписку
    if (unsubscribeUser) {
      unsubscribeUser();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      const userRef = doc(db, "users", userId);

      unsubscribeUser = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            userData.value = {
              userId: snapshot.id,
              ...data,
            };

            // Обновляем локальное хранилище
            if (data.dailyGoal) {
              dailyGoal.value = data.dailyGoal;
              localStorage.setItem("dailyGoal", data.dailyGoal);
            }
          } else {
            // Создаем запись если её нет
            setDoc(userRef, {
              email: auth.currentUser?.email,
              displayName: auth.currentUser?.displayName || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              dailyGoal: dailyGoal.value,
            });
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

  // Сохранение данных пользователя в Firestore
  const saveUserToFirestore = async (updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Save user error:", err);
      throw err;
    }
  };

  // Обновление аватара (сохраняем URL в Firestore)
  const updateAvatar = async (avatarBase64) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      // Сохраняем base64 в Firestore (как и обложки книг)
      await saveUserToFirestore({ avatar: avatarBase64 });
      return true;
    } catch (err) {
      console.error("Update avatar error:", err);
      throw err;
    }
  };

  const setDailyGoal = async (goal) => {
    dailyGoal.value = goal;
    localStorage.setItem("dailyGoal", goal);

    // Синхронизируем с Firestore
    const user = auth.currentUser;
    if (user) {
      await saveUserToFirestore({ dailyGoal: goal });
    }
  };

  // Очистка при логауте
  const cleanup = () => {
    if (unsubscribeUser) {
      unsubscribeUser();
      unsubscribeUser = null;
    }
    userData.value = null;
  };

  return {
    dailyGoal,
    userData,
    loading,
    syncStatus,
    initUserSync,
    saveUserToFirestore,
    updateAvatar,
    setDailyGoal,
    cleanup,
  };
});
