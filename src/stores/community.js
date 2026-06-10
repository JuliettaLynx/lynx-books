import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export const useCommunityStore = defineStore("community", () => {
  const privacy = ref({ isLibraryPublic: false, isWishlistPublic: false });
  const subscriptions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Загрузка приватности
  const loadPrivacy = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      privacy.value = {
        isLibraryPublic: snap.data().isLibraryPublic || false,
        isWishlistPublic: snap.data().isWishlistPublic || false,
      };
    } else {
      // Создаем документ, если его нет
      await setDoc(userRef, {
        isLibraryPublic: false,
        isWishlistPublic: false,
        updatedAt: serverTimestamp(),
      });
      privacy.value = { isLibraryPublic: false, isWishlistPublic: false };
    }
  };

  const updatePrivacy = async (settings) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      isLibraryPublic: settings.isLibraryPublic,
      isWishlistPublic: settings.isWishlistPublic,
      updatedAt: serverTimestamp(),
    });
    privacy.value = settings;
  };

  // Генерация одноразовой ссылки
  const generateShareLink = async (grantLibrary, grantWishlist) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней
    const linkRef = collection(db, "sharedLinks");
    await addDoc(linkRef, {
      userId: user.uid,
      token,
      grantsLibraryAccess: grantLibrary,
      grantsWishlistAccess: grantWishlist,
      expiresAt,
      isUsed: false,
      createdAt: serverTimestamp(),
    });
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/community?share=${token}`;
    return { link, token, expiresAt };
  };

  // Валидация токена
  const validateShareToken = async (token) => {
    const q = query(collection(db, "sharedLinks"), where("token", "==", token));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { isValid: false };
    const data = snapshot.docs[0].data();
    if (data.isUsed || data.expiresAt.toDate() < new Date()) {
      return { isValid: false };
    }
    const userRef = doc(db, "users", data.userId);
    const userSnap = await getDoc(userRef);
    const userName = userSnap.exists()
      ? userSnap.data().displayName || userSnap.data().email
      : "Пользователь";
    return {
      isValid: true,
      userId: data.userId,
      userName,
      libraryAccess: data.grantsLibraryAccess,
      wishlistAccess: data.grantsWishlistAccess,
    };
  };

  // Поиск пользователей
  const searchUsers = async (queryText) => {
    if (!queryText?.trim()) return [];

    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const currentUserId = auth.currentUser?.uid;
      const queryLower = queryText.toLowerCase().trim();

      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (u) =>
            u.id !== currentUserId &&
            u.displayName?.toLowerCase().includes(queryLower),
        );
    } catch (err) {
      console.error("Search users error:", err);
      return [];
    }
  };

  // Подписка
  const subscribe = async (targetUserId, listType = null) => {
    const subscriberId = auth.currentUser?.uid;
    if (!subscriberId) throw new Error("Not authenticated");

    // Проверяем, существует ли уже такая подписка
    const subRef = collection(db, "subscriptions");

    // Создаём запрос с правильными условиями
    let q;
    if (listType) {
      q = query(
        subRef,
        where("subscriberId", "==", subscriberId),
        where("targetId", "==", targetUserId),
        where("listType", "==", listType),
      );
    } else {
      q = query(
        subRef,
        where("subscriberId", "==", subscriberId),
        where("targetId", "==", targetUserId),
        where("listType", "==", null),
      );
    }

    const existing = await getDocs(q);
    if (!existing.empty) return;

    await addDoc(subRef, {
      subscriberId,
      targetId: targetUserId,
      listType: listType || null,
      createdAt: serverTimestamp(),
    });

    await loadSubscriptions();
  };

  const unsubscribe = async (targetUserId, listType = null) => {
    const subscriberId = auth.currentUser?.uid;
    if (!subscriberId) return;

    const subRef = collection(db, "subscriptions");

    // Создаём запрос с правильными условиями
    let q;
    if (listType !== null) {
      q = query(
        subRef,
        where("subscriberId", "==", subscriberId),
        where("targetId", "==", targetUserId),
        where("listType", "==", listType),
      );
    } else {
      q = query(
        subRef,
        where("subscriberId", "==", subscriberId),
        where("targetId", "==", targetUserId),
        where("listType", "==", null),
      );
    }

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    await loadSubscriptions();
  };

  const loadSubscriptions = async () => {
    loading.value = true;
    error.value = null;
    const subscriberId = auth.currentUser?.uid;
    if (!subscriberId) {
      subscriptions.value = [];
      loading.value = false;
      return;
    }
    try {
      const subsRef = collection(db, "subscriptions");
      const q = query(subsRef, where("subscriberId", "==", subscriberId));
      const snapshot = await getDocs(q);

      // Группируем по targetId
      const groups = new Map();

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const targetId = data.targetId;

        if (!groups.has(targetId)) {
          try {
            const userDoc = await getDoc(doc(db, "users", targetId));
            const userData = userDoc.exists() ? userDoc.data() : null;

            groups.set(targetId, {
              userId: targetId,
              displayName:
                userData?.displayName || userData?.email || "Пользователь",
              avatar: userData?.avatar || null,
              hasLibraryAccess: false,
              hasWishlistAccess: false,
            });
          } catch (userErr) {
            console.error(`Error fetching user ${targetId}:`, userErr);
            groups.set(targetId, {
              userId: targetId,
              displayName: "Пользователь",
              avatar: null,
              hasLibraryAccess: false,
              hasWishlistAccess: false,
            });
          }
        }

        const group = groups.get(targetId);
        const listType = data.listType;

        if (listType === "library") {
          group.hasLibraryAccess = true;
        } else if (listType === "wishlist") {
          group.hasWishlistAccess = true;
        } else if (listType === null || listType === undefined) {
          // Общая подписка – даёт доступ к публичным спискам
          try {
            const userDoc = await getDoc(doc(db, "users", targetId));
            const userData = userDoc.exists() ? userDoc.data() : null;
            if (userData?.isLibraryPublic) group.hasLibraryAccess = true;
            if (userData?.isWishlistPublic) group.hasWishlistAccess = true;
          } catch (userErr) {
            console.error(`Error checking privacy for ${targetId}:`, userErr);
          }
        }
      }

      subscriptions.value = Array.from(groups.values());
    } catch (err) {
      console.error("Load subscriptions error:", err);
      error.value = err.message || "Ошибка загрузки подписок";
    } finally {
      loading.value = false;
    }
  };

  // Проверка доступа к списку другого пользователя
  const canAccessList = async (ownerUserId, listType, sharedToken = null) => {
    try {
      const currentUserId = auth.currentUser?.uid;

      // 1. Сам владелец
      if (currentUserId === ownerUserId) return true;

      // 2. Одноразовая ссылка
      if (sharedToken) {
        try {
          const q = query(
            collection(db, "sharedLinks"),
            where("token", "==", sharedToken),
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const linkDoc = snap.docs[0];
            const link = linkDoc.data();

            if (
              link.userId === ownerUserId &&
              !link.isUsed &&
              (link.expiresAt?.toDate
                ? link.expiresAt.toDate()
                : new Date(link.expiresAt)) > new Date()
            ) {
              const hasAccess =
                listType === "library"
                  ? link.grantsLibraryAccess
                  : link.grantsWishlistAccess;

              if (hasAccess) {
                // Помечаем ссылку как использованную
                await updateDoc(linkDoc.ref, { isUsed: true });
                return true;
              }
            }
          }
        } catch (linkErr) {
          console.error("Error checking shared link:", linkErr);
        }
      }

      // 3. Прямая подписка на конкретный список
      try {
        const subQuery = query(
          collection(db, "subscriptions"),
          where("subscriberId", "==", currentUserId),
          where("targetId", "==", ownerUserId),
          where("listType", "==", listType),
        );
        const directSnap = await getDocs(subQuery);
        if (!directSnap.empty) return true;
      } catch (subErr) {
        console.error("Error checking direct subscription:", subErr);
      }

      // 4. Общая подписка + публичность
      try {
        const generalQuery = query(
          collection(db, "subscriptions"),
          where("subscriberId", "==", currentUserId),
          where("targetId", "==", ownerUserId),
          where("listType", "==", null),
        );
        const generalSnap = await getDocs(generalQuery);

        if (!generalSnap.empty) {
          const userDoc = await getDoc(doc(db, "users", ownerUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const isPublic =
              listType === "library"
                ? userData?.isLibraryPublic
                : userData?.isWishlistPublic;

            if (isPublic) return true;
          }
        }
      } catch (generalErr) {
        console.error("Error checking general subscription:", generalErr);
      }

      return false;
    } catch (err) {
      console.error("Can access list error:", err);
      return false;
    }
  };

  // Получение чужой библиотеки (с проверкой прав)
  const fetchUserLibrary = async (ownerUserId, sharedToken = null) => {
    const hasAccess = await canAccessList(ownerUserId, "library", sharedToken);
    if (!hasAccess) throw new Error("Access denied");
    const booksRef = collection(db, `users/${ownerUserId}/books`);
    const q = query(booksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const fetchUserWishlist = async (ownerUserId, sharedToken = null) => {
    const hasAccess = await canAccessList(ownerUserId, "wishlist", sharedToken);
    if (!hasAccess) throw new Error("Access denied");
    const wishlistRef = collection(db, `users/${ownerUserId}/wishlist`);
    const q = query(wishlistRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  return {
    privacy,
    subscriptions,
    loading,
    error,
    loadPrivacy,
    updatePrivacy,
    generateShareLink,
    validateShareToken,
    searchUsers,
    subscribe,
    unsubscribe,
    loadSubscriptions,
    canAccessList,
    fetchUserLibrary,
    fetchUserWishlist,
  };
});
