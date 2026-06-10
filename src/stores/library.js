import { defineStore } from "pinia";
import { ref } from "vue";
import { booksAPI } from "../api";
import { booksDB } from "../db/index";
import { auth } from "../firebase/config";

export const useLibraryStore = defineStore("library", () => {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const syncStatus = ref("synced");
  const lastSyncTime = ref(null);

  let unsubscribeBooks = null;

  // ========== Загрузка из IndexedDB ==========
  const loadFromIndexedDB = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const cachedBooks = await booksDB
        .where("userId")
        .equals(user.uid)
        .toArray();
      return cachedBooks;
    } catch (err) {
      console.error("Load from IndexedDB error:", err);
      return [];
    }
  };

  // ========== Синхронизация ==========
  const initSync = async (userId) => {
    if (!userId) return;

    if (unsubscribeBooks) {
      unsubscribeBooks();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      // Сначала загружаем из кэша
      const cached = await loadFromIndexedDB();
      if (cached.length > 0) {
        books.value = cached;
      }

      // Подписываемся на реальные данные
      unsubscribeBooks = booksAPI.subscribe(
        (fetchedBooks) => {
          books.value = fetchedBooks;
          loading.value = false;
          lastSyncTime.value = new Date();
          error.value = null;
        },
        (err) => {
          console.error("Sync error:", err);
          syncStatus.value = "error";
          error.value = err.message;
          loading.value = false;
        },
      );
    } catch (err) {
      console.error("Init sync error:", err);
      error.value = err.message;
      syncStatus.value = "error";
      loading.value = false;
    }
  };

  const cleanup = () => {
    if (unsubscribeBooks) {
      unsubscribeBooks();
      unsubscribeBooks = null;
    }
    books.value = [];
    error.value = null;
  };

  // ========== CRUD операции ==========
  const addBook = async (bookData) => {
    try {
      const newBook = await booksAPI.create(bookData);

      // Сохраняем в IndexedDB
      await booksDB.put({
        id: newBook.id,
        title: newBook.title,
        author: newBook.author,
        publisher: newBook.publisher,
        format: newBook.format,
        status: newBook.status,
        rating: newBook.rating,
        review: newBook.review,
        description: newBook.description,
        isFavorite: newBook.isFavorite,
        cover: newBook.cover,
        originalCover: newBook.originalCover,
        createdAt: newBook.createdAt,
        updatedAt: newBook.updatedAt,
        userId: auth.currentUser?.uid,
      });

      return newBook;
    } catch (err) {
      console.error("Add book error:", err);
      throw err;
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      await booksAPI.update(id, bookData);

      // Обновляем в IndexedDB
      await booksDB.update(id, {
        ...bookData,
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error("Update book error:", err);
      throw err;
    }
  };

  const deleteBook = async (id) => {
    try {
      await booksAPI.delete(id);
      await booksDB.delete(id);
      return true;
    } catch (err) {
      console.error("Delete book error:", err);
      throw err;
    }
  };

  const toggleFavorite = async (book) => {
    try {
      const newFavorite = await booksAPI.toggleFavorite(book.id);

      // Обновляем в IndexedDB
      await booksDB.update(book.id, {
        isFavorite: newFavorite,
        updatedAt: new Date().toISOString(),
      });

      return newFavorite;
    } catch (err) {
      console.error("Toggle favorite error:", err);
      throw err;
    }
  };

  // ========== Получение данных ==========
  const getBook = async (id) => {
    try {
      return await booksAPI.getById(id);
    } catch (err) {
      console.error("Get book error:", err);
      return null;
    }
  };

  const getUnreadBooks = () => {
    return books.value.filter((book) => book.status !== "прочитано");
  };

  const getBooksByStatus = (status) => {
    return books.value.filter((book) => book.status === status);
  };

  const getFavoriteBooks = () => {
    return books.value.filter((book) => book.isFavorite);
  };

  // ========== Инициализация ==========
  const init = () => {
    console.log("Library store initialized");
    // Слушаем изменения сети
    window.addEventListener("online", () => {
      if (syncStatus.value === "offline") {
        syncStatus.value = "synced";
      }
    });
    window.addEventListener("offline", () => {
      syncStatus.value = "offline";
    });
  };

  return {
    books,
    loading,
    error,
    syncStatus,
    lastSyncTime,
    init,
    initSync,
    cleanup,
    addBook,
    updateBook,
    deleteBook,
    toggleFavorite,
    getBook,
    getUnreadBooks,
    getBooksByStatus,
    getFavoriteBooks,
  };
});
