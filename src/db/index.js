import Dexie from "dexie";

export const db = new Dexie("lynx-books-db");

// Версия 10 с новыми таблицами
db.version(10).stores({
  books: "id, title, author, status, format, isFavorite, rating, updatedAt, userId",
  users: "userId, email, dailyGoal, updatedAt",
  sessions: "id, bookId, date, finishedBook, pagesRead, color, updatedAt, userId",
  offlineQueue: "++id, url, method, body, timestamp",
  wishlistBooks: "id, title, author, priority, updatedAt, userId",
});

export const booksDB = db.books;
export const usersDB = db.users;
export const sessionsDB = db.sessions;
export const offlineQueueDB = db.offlineQueue;
export const wishlistDB = db.wishlistBooks;
