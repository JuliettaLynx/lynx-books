import { defineStore } from "pinia";
import { ref } from "vue";
import { wishlistAPI } from "../api";
import { wishlistDB } from "../db/index";
import { auth } from "../firebase/config";

export const useWishlistStore = defineStore("wishlist", () => {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const syncStatus = ref("synced");

  let unsubscribeWishlist = null;

  // ========== Загрузка из IndexedDB ==========
  const loadFromIndexedDB = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return [];
      
      const cachedBooks = await wishlistDB.where("userId").equals(user.uid).toArray();
      return cachedBooks;
    } catch (err) {
      console.error("Load from IndexedDB error:", err);
      return [];
    }
  };

  // ========== Инициализация синхронизации ==========
  const initSync = async (userId) => {
    if (!userId) return;
    if (unsubscribeWishlist) unsubscribeWishlist();

    loading.value = true;
    syncStatus.value = "synced";

    try {
      // Сначала загружаем из кэша
      const cached = await loadFromIndexedDB();
      if (cached.length > 0) {
        books.value = cached;
      }

      // Подписываемся на реальные данные
      unsubscribeWishlist = wishlistAPI.subscribe(
        async (fetchedBooks) => {
          books.value = fetchedBooks;
          loading.value = false;
          error.value = null;
        },
        (err) => {
          console.error("Wishlist sync error:", err);
          error.value = err.message;
          loading.value = false;
          syncStatus.value = "error";
        },
      );
    } catch (err) {
      console.error("Init wishlist sync error:", err);
      loading.value = false;
    }
  };

  const cleanup = () => {
    if (unsubscribeWishlist) unsubscribeWishlist();
    books.value = [];
  };

  // ========== CRUD операции ==========
  const addBook = async (bookData) => {
    try {
      const newBook = await wishlistAPI.create(bookData);
      
      // Сохраняем в IndexedDB
      await wishlistDB.put({
        id: newBook.id,
        title: newBook.title,
        author: newBook.author,
        publisher: newBook.publisher,
        cover: newBook.cover,
        originalCover: newBook.originalCover,
        binding: newBook.binding,
        priority: newBook.priority,
        note: newBook.note,
        description: newBook.description,
        userId: auth.currentUser?.uid,
        createdAt: newBook.createdAt,
        updatedAt: newBook.updatedAt,
      });

      return newBook.id;
    } catch (err) {
      console.error("Add wishlist error:", err);
      throw err;
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      await wishlistAPI.update(id, bookData);
      
      // Обновляем в IndexedDB
      await wishlistDB.update(id, {
        ...bookData,
        updatedAt: new Date().toISOString(),
      });
      
      return true;
    } catch (err) {
      console.error("Update wishlist error:", err);
      throw err;
    }
  };

  const deleteBook = async (id) => {
    try {
      await wishlistAPI.delete(id);
      await wishlistDB.delete(id);
      return true;
    } catch (err) {
      console.error("Delete wishlist error:", err);
      throw err;
    }
  };

  const updatePriority = async (id, priority) => {
    await updateBook(id, { priority });
  };

  // Получение книг для ExternalListView
  const fetchUserWishlist = async (userId) => {
    try {
      return await wishlistAPI.getAll();
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      return [];
    }
  };

  return {
    books,
    loading,
    error,
    syncStatus,
    initSync,
    cleanup,
    addBook,
    updateBook,
    deleteBook,
    updatePriority,
    fetchUserWishlist,
  };
});
