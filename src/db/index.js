import Dexie from "dexie";

export const db = new Dexie("lynx-books-db");

// Определяем схему базы данных
db.version(1).stores({
  books:
    "++id, title, author, status, isFavorite, rating, format, description, cover, createdAt",
});

// Создаем таблицу с индексами для поиска и сортировки
export const booksDB = db.books;
