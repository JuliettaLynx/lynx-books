import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "../db";

export const useLibraryStore = defineStore("library", () => {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Загрузка всех книг
  const loadBooks = async () => {
    loading.value = true;
    error.value = null;
    try {
      books.value = await db.books.toArray();
      // Сортируем по id (новые сверху)
      books.value.sort((a, b) => b.id - a.id);
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка загрузки книг:", err);
    } finally {
      loading.value = false;
    }
  };

  // Добавление книги
  const addBook = async (bookData) => {
    loading.value = true;
    error.value = null;
    try {
      const newBook = {
        ...bookData,
        createdAt: new Date().toISOString(),
        isFavorite: bookData.isFavorite || false,
        rating: bookData.rating || 0,
      };

      const id = await db.books.add(newBook);
      await loadBooks(); // Перезагружаем список
      return id;
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка добавления книги:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Обновление книги
  const updateBook = async (id, bookData) => {
    loading.value = true;
    error.value = null;
    try {
      await db.books.update(id, {
        ...bookData,
        updatedAt: new Date().toISOString(),
      });
      await loadBooks(); // Перезагружаем список
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка обновления книги:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Удаление книги
  const deleteBook = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await db.books.delete(id);
      await loadBooks(); // Перезагружаем список
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка удаления книги:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Переключение избранного
  const toggleFavorite = async (book) => {
    try {
      await db.books.update(book.id, {
        isFavorite: !book.isFavorite,
      });
      // Обновляем локальный массив
      const index = books.value.findIndex((b) => b.id === book.id);
      if (index !== -1) {
        books.value[index] = {
          ...books.value[index],
          isFavorite: !book.isFavorite,
        };
      }
    } catch (err) {
      error.value = err.message;
      console.error("Ошибка обновления избранного:", err);
      throw err;
    }
  };

  // Поиск книг (для модального окна добавления сессии)
  const searchUnreadBooks = async (query) => {
    try {
      if (!query) {
        return await db.books.where("status").equals("не прочитано").toArray();
      }

      // Поиск по названию и автору среди непрочитанных книг
      const allUnread = await db.books
        .where("status")
        .equals("не прочитано")
        .toArray();

      return allUnread.filter(
        (book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()),
      );
    } catch (err) {
      console.error("Ошибка поиска книг:", err);
      return [];
    }
  };

  return {
    books,
    loading,
    error,
    loadBooks,
    addBook,
    updateBook,
    deleteBook,
    toggleFavorite,
    searchUnreadBooks,
  };
});
