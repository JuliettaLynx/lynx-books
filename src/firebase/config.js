import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Проверка наличия конфигурации
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your-api-key-here") {
  console.error(
    "Firebase configuration is missing. Please check your .env file.\n" +
      "Copy .env.example to .env and fill in your Firebase project details.",
  );
}
console.log("Initializing Firebase with project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // Размер кэша (можно указать в байтах)
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    // Синхронизация между вкладками
    tabManager: persistentMultipleTabManager(),
  }),
});
