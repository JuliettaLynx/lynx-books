import { defineStore } from "pinia";
import { ref } from "vue";
import { sessionsAPI } from "../api";
import { sessionsDB } from "../db/index";
import { auth } from "../firebase/config";
import { useLibraryStore } from "./library";

export const useSessionStore = defineStore("session", () => {
  const sessions = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const syncStatus = ref("synced");
  const lastSession = ref(null);

  let unsubscribeSessions = null;

  // ========== Загрузка из IndexedDB ==========
  const loadFromIndexedDB = async (userId) => {
    try {
      if (!userId) return [];
      const cachedSessions = await sessionsDB.where("userId").equals(userId).toArray();
      return cachedSessions;
    } catch (err) {
      console.error("Load from IndexedDB error:", err);
      return [];
    }
  };

  // ========== Работа с localStorage ==========
  const loadLastSession = () => {
    const saved = localStorage.getItem("lastSession");
    if (saved) {
      try {
        lastSession.value = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing last session:", e);
      }
    }
    return lastSession.value;
  };

  const saveLastSession = (session) => {
    if (session && session.bookId) {
      lastSession.value = {
        bookId: session.bookId,
        bookTitle: session.bookTitle,
        color: session.color,
      };
      localStorage.setItem("lastSession", JSON.stringify(lastSession.value));
    }
  };

  // ========== Синхронизация ==========
  const initSync = async (userId) => {
    if (!userId) return;

    if (unsubscribeSessions) {
      unsubscribeSessions();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      // Сначала загружаем из кэша
      const cached = await loadFromIndexedDB(userId);
      if (cached.length > 0) {
        sessions.value = cached;
      }

      // Подписываемся на реальные данные
      unsubscribeSessions = sessionsAPI.subscribe(
        userId,
        (fetchedSessions) => {
          sessions.value = fetchedSessions;
          loading.value = false;
          error.value = null;
        },
        (err) => {
          console.error("Sessions sync error:", err);
          syncStatus.value = "error";
          error.value = err.message;
          loading.value = false;
        },
      );
    } catch (err) {
      console.error("Init sessions sync error:", err);
      loading.value = false;
    }
  };

  const cleanup = () => {
    if (unsubscribeSessions) {
      unsubscribeSessions();
      unsubscribeSessions = null;
    }
    sessions.value = [];
  };

  // ========== Получение данных ==========
  const getSessionsByDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return sessions.value.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= targetDate && sessionDate < nextDate;
    });
  };

  const getPagesReadByDate = (date) => {
    const daySessions = getSessionsByDate(date);
    return daySessions.reduce(
      (sum, session) => sum + (session.pagesRead || 0),
      0,
    );
  };

  const getSessionsByBook = (bookId) => {
    return sessions.value.filter((session) => session.bookId === bookId);
  };

  const getBookStats = (bookId) => {
    const bookSessions = getSessionsByBook(bookId);
    const totalPagesRead = bookSessions.reduce(
      (sum, session) => sum + (session.pagesRead || 0),
      0,
    );
    const lastReadDate =
      bookSessions.length > 0
        ? Math.max(...bookSessions.map((s) => new Date(s.date).getTime()))
        : null;

    return {
      totalPagesRead,
      sessionsCount: bookSessions.length,
      lastReadDate: lastReadDate ? new Date(lastReadDate) : null,
      finished: bookSessions.some((s) => s.finishedBook),
    };
  };

  // ========== CRUD операции ==========
  const addSession = async (sessionData) => {
    try {
      const libraryStore = useLibraryStore();
      const newSession = await sessionsAPI.create(sessionData);

      saveLastSession({
        bookId: sessionData.bookId,
        bookTitle: sessionData.bookTitle,
        color: sessionData.color,
      });

      if (sessionData.finishedBook) {
        await libraryStore.updateBook(sessionData.bookId, {
          status: "прочитано",
          rating: sessionData.rating || 0,
        });
      }

      return newSession.id;
    } catch (err) {
      console.error("Add session error:", err);
      error.value = err.message;
      throw err;
    }
  };

  const updateSession = async (id, sessionData) => {
    const libraryStore = useLibraryStore();
    const originalSession = sessions.value.find((s) => s.id === id);

    try {
      await sessionsAPI.update(id, sessionData);

      if (sessionData.finishedBook && !originalSession?.finishedBook) {
        await libraryStore.updateBook(sessionData.bookId, {
          status: "прочитано",
          rating: sessionData.rating || 0,
        });
      }
      
      return true;
    } catch (err) {
      console.error("Update session error:", err);
      error.value = err.message;
      throw err;
    }
  };

  const deleteSession = async (id) => {
    try {
      await sessionsAPI.delete(id);
      return true;
    } catch (err) {
      console.error("Delete session error:", err);
      error.value = err.message;
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    syncStatus,
    lastSession,
    initSync,
    cleanup,
    addSession,
    updateSession,
    deleteSession,
    getSessionsByDate,
    getPagesReadByDate,
    getSessionsByBook,
    getBookStats,
    loadLastSession,
    saveLastSession,
  };
});
