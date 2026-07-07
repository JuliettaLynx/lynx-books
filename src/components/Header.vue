<template>
  <header
    class="top-0 z-30 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)] transition-colors duration-200"
  >
    <div class="px-4 py-2 flex justify-between items-center gap-3">
      <!-- Бургер-кнопка -->
      <button
        class="hidden z-50 flex-col justify-center items-center w-10 h-10 rounded-lg transition-colors duration-150 lg:flex"
        @click="toggleMenu"
        :aria-label="isSidebarOpen ? 'Закрыть меню' : 'Открыть меню'"
      >
        <span
          class="block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300"
          :class="isSidebarOpen ? 'rotate-45 translate-y-[8px]' : ''"
        ></span>
        <span
          class="block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 mt-1.5"
          :class="isSidebarOpen ? 'opacity-0' : ''"
        ></span>
        <span
          class="block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-all duration-300 mt-1.5"
          :class="isSidebarOpen ? '-rotate-45 translate-y-[-8px]' : ''"
        ></span>
      </button>

      <!-- Заголовок страницы -->
      <h1
        class="text-xl tracking-wider font-bold dark:text-white transition-all duration-300 truncate"
      >
        {{ pageTitle }}
      </h1>

      <!-- Иконка профиля -->
      <UserProfile />
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import UserProfile from "./UserProfile.vue";

const route = useRoute();

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-menu"]);

const toggleMenu = () => {
  emit("toggle-menu");
};

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
