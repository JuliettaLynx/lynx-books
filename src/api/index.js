import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { booksDB, sessionsDB, wishlistDB, usersDB } from "../db/index";

/**
 * API клиент для работы с Firebase Firestore
 * С абстракцией для кэширования в IndexedDB
 */

// ========== Утилиты ==========
const getCurrentUserId = () => auth.currentUser?.uid;

const ensureAuthenticated = () => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
};

// ========== Книги (Books API) ==========
const booksAPI = {
  // Получить все книги пользователя
  async getAll(search = null, filter = null, sort = null) {
    const userId = ensureAuthenticated();
    try {
      const booksRef = collection(db, `users/${userId}/books`);
      let q = query(booksRef, orderBy("createdAt", "desc"));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Get books error:", err);
      throw err;
    }
  },

  // Получить одну книгу
  async getById(id) {
    const userId = ensureAuthenticated();
    try {
      const bookRef = doc(db, `users/${userId}/books/${id}`);
      const snapshot = await getDoc(bookRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (err) {
      console.error("Get book error:", err);
      throw err;
    }
  },

  // Создать книгу
  async create(bookData) {
    const userId = ensureAuthenticated();

    try {
      const booksRef = collection(db, `users/${userId}/books`);
      const docRef = await addDoc(booksRef, {
        ...bookData,
        isFavorite: bookData.isFavorite || false,
        rating: bookData.rating || 0,
        format: bookData.format || "paper",
        status: bookData.status || "не прочитано",
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, ...bookData };
    } catch (err) {
      console.error("Create book error:", err);
      throw err;
    }
  },

  // Обновить книгу
  async update(id, bookData) {
    const userId = ensureAuthenticated();
    try {
      const bookRef = doc(db, `users/${userId}/books/${id}`);
      await updateDoc(bookRef, {
        ...bookData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Update book error:", err);
      throw err;
    }
  },

  // Удалить книгу
  async delete(id) {
    const userId = ensureAuthenticated();
    try {
      const bookRef = doc(db, `users/${userId}/books/${id}`);
      await deleteDoc(bookRef);
      return true;
    } catch (err) {
      console.error("Delete book error:", err);
      throw err;
    }
  },

  // Переключить избранное
  async toggleFavorite(id) {
    const book = await this.getById(id);
    if (!book) throw new Error("Book not found");

    await this.update(id, { isFavorite: !book.isFavorite });
    return !book.isFavorite;
  },

  // Подписка на изменения книг
  subscribe(onChange, onError) {
    const userId = ensureAuthenticated();
    const booksRef = collection(db, `users/${userId}/books`);
    const q = query(booksRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const books = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate?.() || d.data().updatedAt,
        }));

        // Сохраняем в IndexedDB
        for (const book of books) {
          await booksDB.put({
            id: book.id,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            format: book.format,
            status: book.status,
            rating: book.rating,
            review: book.review,
            description: book.description,
            isFavorite: book.isFavorite,
            cover: book.cover,
            originalCover: book.originalCover,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
            userId,
          });
        }

        onChange(books);
      },
      (err) => {
        console.error("Books subscription error:", err);
        onError?.(err);
      },
    );

    return unsubscribe;
  },
};

// ========== Сессии (Sessions API) ==========
const sessionsAPI = {
  // Получить все сессии
  async getAll(userId = null) {
    const currentUserId = userId || ensureAuthenticated();
    try {
      const sessionsRef = collection(db, `users/${currentUserId}/sessions`);
      const q = query(sessionsRef, orderBy("date", "desc"));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        date: d.data().date?.toDate?.() || d.data().date,
        createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
      }));
    } catch (err) {
      console.error("Get sessions error:", err);
      throw err;
    }
  },

  // Получить сессию по ID
  async getById(id) {
    const userId = ensureAuthenticated();
    try {
      const sessionRef = doc(db, `users/${userId}/sessions/${id}`);
      const snapshot = await getDoc(sessionRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
          date: data.date?.toDate?.() || data.date,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
        };
      }
      return null;
    } catch (err) {
      console.error("Get session error:", err);
      throw err;
    }
  },

  // Создать сессию
  async create(sessionData) {
    const userId = ensureAuthenticated();

    const pagesRead =
      sessionData.pagesRead ||
      (sessionData.endPage && sessionData.startPage
        ? sessionData.endPage - sessionData.startPage + 1
        : 0);

    try {
      const sessionsRef = collection(db, `users/${userId}/sessions`);
      const docRef = await addDoc(sessionsRef, {
        ...sessionData,
        pagesRead,
        finishedBook: sessionData.finishedBook || false,
        rating: sessionData.rating || 0,
        color: sessionData.color || "#3B82F6",
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, ...sessionData, pagesRead };
    } catch (err) {
      console.error("Create session error:", err);
      throw err;
    }
  },

  // Обновить сессию
  async update(id, sessionData) {
    const userId = ensureAuthenticated();
    try {
      const sessionRef = doc(db, `users/${userId}/sessions/${id}`);

      const pagesRead =
        sessionData.pagesRead ||
        (sessionData.endPage && sessionData.startPage
          ? sessionData.endPage - sessionData.startPage + 1
          : undefined);

      await updateDoc(sessionRef, {
        ...sessionData,
        ...(pagesRead !== undefined && { pagesRead }),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Update session error:", err);
      throw err;
    }
  },

  // Удалить сессию
  async delete(id) {
    const userId = ensureAuthenticated();
    try {
      const sessionRef = doc(db, `users/${userId}/sessions/${id}`);
      await deleteDoc(sessionRef);
      return true;
    } catch (err) {
      console.error("Delete session error:", err);
      throw err;
    }
  },

  // Подписка на сессии
  subscribe(userId, onChange, onError) {
    const sessionsRef = collection(db, `users/${userId}/sessions`);
    const q = query(sessionsRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const sessions = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          date: d.data().date?.toDate?.() || d.data().date,
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate?.() || d.data().updatedAt,
        }));

        // Сохраняем в IndexedDB
        for (const session of sessions) {
          await sessionsDB.put({
            id: session.id,
            bookId: session.bookId,
            bookTitle: session.bookTitle,
            date: session.date,
            finishedBook: session.finishedBook,
            pagesRead: session.pagesRead,
            color: session.color,
            startDate: session.startDate,
            startPage: session.startPage,
            endPage: session.endPage,
            rating: session.rating,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            userId,
          });
        }

        onChange(sessions);
      },
      (err) => {
        console.error("Sessions subscription error:", err);
        onError?.(err);
      },
    );

    return unsubscribe;
  },
};

// ========== Вишлист (Wishlist API) ==========
const wishlistAPI = {
  // Получить все книги вишлиста
  async getAll() {
    const userId = ensureAuthenticated();
    try {
      const wishlistRef = collection(db, `users/${userId}/wishlist`);
      const q = query(wishlistRef, orderBy("createdAt", "desc"));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Get wishlist error:", err);
      throw err;
    }
  },

  // Создать книгу в вишлисте
  async create(bookData) {
    const userId = ensureAuthenticated();
    try {
      const wishlistRef = collection(db, `users/${userId}/wishlist`);
      const docRef = await addDoc(wishlistRef, {
        ...bookData,
        priority: bookData.priority || 1,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, ...bookData };
    } catch (err) {
      console.error("Create wishlist book error:", err);
      throw err;
    }
  },

  // Обновить книгу в вишлисте
  async update(id, bookData) {
    const userId = ensureAuthenticated();
    try {
      const bookRef = doc(db, `users/${userId}/wishlist/${id}`);
      await updateDoc(bookRef, {
        ...bookData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Update wishlist book error:", err);
      throw err;
    }
  },

  // Удалить книгу из вишлиста
  async delete(id) {
    const userId = ensureAuthenticated();
    try {
      const bookRef = doc(db, `users/${userId}/wishlist/${id}`);
      await deleteDoc(bookRef);
      return true;
    } catch (err) {
      console.error("Delete wishlist book error:", err);
      throw err;
    }
  },

  // Подписка на вишлист
  subscribe(onChange, onError) {
    const userId = ensureAuthenticated();
    const wishlistRef = collection(db, `users/${userId}/wishlist`);
    const q = query(wishlistRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const books = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate?.() || d.data().updatedAt,
        }));

        // Сохраняем в IndexedDB
        for (const book of books) {
          await wishlistDB.put({
            id: book.id,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            cover: book.cover,
            originalCover: book.originalCover,
            binding: book.binding,
            priority: book.priority,
            note: book.note,
            description: book.description,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
            userId,
          });
        }

        onChange(books);
      },
      (err) => {
        console.error("Wishlist subscription error:", err);
        onError?.(err);
      },
    );

    return unsubscribe;
  },
};

// ========== Пользователь (User API) ==========
const userAPI = {
  // Получить данные пользователя
  async get(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (err) {
      console.error("Get user error:", err);
      throw err;
    }
  },

  // Создать/обновить данные пользователя
  async upsert(userData) {
    const userId = ensureAuthenticated();
    try {
      const userRef = doc(db, "users", userId);

      const now = serverTimestamp();
      await updateDoc(userRef, {
        ...userData,
        updatedAt: now,
      });

      return true;
    } catch (err) {
      console.error("Upsert user error:", err);
      throw err;
    }
  },

  // Подписка на данные пользователя
  subscribe(userId, onChange, onError) {
    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const user = {
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          };

          // Сохраняем в IndexedDB
          await usersDB.put({
            userId: user.id,
            email: user.email,
            dailyGoal: user.dailyGoal,
            displayName: user.displayName,
            avatar: user.avatar,
            originalAvatar: user.originalAvatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          });

          onChange(user);
        } else {
          // Создаем документ пользователя если не существует
          const defaultUserData = {
            email: auth.currentUser?.email || "",
            displayName: auth.currentUser?.displayName || "",
            dailyGoal: 50,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, defaultUserData);
        }
      },
      (err) => {
        console.error("User subscription error:", err);
        onError?.(err);
      },
    );

    return unsubscribe;
  },

  // Обновить профиль
  async updateProfile(updates) {
    const userId = ensureAuthenticated();
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  },
};

export { booksAPI, sessionsAPI, wishlistAPI, userAPI };
export default {
  books: booksAPI,
  sessions: sessionsAPI,
  wishlist: wishlistAPI,
  user: userAPI,
};
