<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-14">
    <LoadingSpinner v-if="!authReady" />
    <template v-else>
      <router-view />
      <TabBar v-if="user && $route.meta.showBottomNav" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth } from "./firebase/config";
import TabBar from "./components/TabBar.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import { useLibraryStore } from "./stores/library";

const user = ref(null);
const authReady = ref(false);

const libraryStore = useLibraryStore();

// Инициализация
onMounted(() => {
  libraryStore.init();

  auth.onAuthStateChanged((currentUser) => {
    console.log("Auth state changed:", currentUser?.email);
    user.value = currentUser;
    authReady.value = true;

    if (currentUser) {
      // Запускаем синхронизацию для всех сториков
      libraryStore.initSync(currentUser.uid);
    } else {
      // Очищаем данные при выходе
      libraryStore.cleanup();
    }
  });
});
</script>
