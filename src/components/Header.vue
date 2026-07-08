<template>
  <header
    class="top-0 z-30 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)] transition-colors duration-200"
  >
    <div class="px-5 py-2">
      <!-- Заголовок страницы -->
      <h1
        class="absolute pt-1 text-xl tracking-wider font-bold dark:text-white transition-all duration-300 truncate"
      >
        {{ pageTitle }}
      </h1>

      <!-- Иконка профиля -->
      <UserProfile class="absolute flex justify-end -right-2.5 z-40" />
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import UserProfile from "./UserProfile.vue";

const route = useRoute();

const pageTitle = computed(() => {
  const titles = {
    "/library": "Библиотека",
    "/tracker": "Трекер",
    "/wishlist": "Вишлист",
    "/community": "Сообщество",
  };
  return titles[route.path] || "";
});
</script>
