<template>
  <div
    class="dark pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <LoadingSpinner v-if="!authReady" fullscreen />
    <template v-else>
      <Sidebar
        v-if="user && $route.meta.showBottomNav"
        class="hidden lg:flex"
      />

      <Header v-if="user" class="lg:pl-16" />

      <!-- Контент -->
      <div class="transition-all duration-300">
        <router-view
          v-if="user && $route.meta.showBottomNav"
          class="pl-0 lg:pl-16"
        />
        <router-view v-else class="pl-0" />
      </div>

      <!-- TabBar (только на mobile) -->
      <TabBar v-if="user && $route.meta.showBottomNav" class="lg:hidden" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth } from "./firebase/config";
import TabBar from "./components/TabBar.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";
import { useLibraryStore } from "./stores/library";
import { useUserStore } from "./stores/user";

const user = ref(null);
const authReady = ref(false);
const isSidebarOpen = ref(false);

const libraryStore = useLibraryStore();
const userStore = useUserStore();

onMounted(() => {
  libraryStore.init();

  auth.onAuthStateChanged((currentUser) => {
    console.log("Auth state changed:", currentUser?.email);
    user.value = currentUser;
    authReady.value = true;

    if (currentUser) {
      libraryStore.initSync(currentUser.uid);
      userStore.initUserSync(currentUser.uid);
    } else {
      libraryStore.cleanup();
      userStore.cleanup();
    }
  });
});
</script>
