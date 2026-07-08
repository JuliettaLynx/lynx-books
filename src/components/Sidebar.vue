<template>
  <div
    class="fixed inset-y-0 left-0 z-50 w-16 bg-white/90 dark:bg-bg-secondary-dark/90 shadow-2xl border-r border-border dark:border-border-dark flex flex-col items-center py-4 gap-1"
  >
    <div class="w-10 h-10"></div>
    <!-- Навигация -->
    <nav class="flex flex-col items-center gap-2 flex-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @click="onNavClick"
        class="relative group flex items-center justify-center w-10 h-10 rounded-lg hover:bg-border dark:hover:bg-border-dark transition-colors duration-150"
        :class="{
          'bg-border dark:bg-border-dark': $route.path === item.path,
        }"
      >
        <span class="text-lg">{{ item.icon }}</span>

        <!-- Тултип -->
        <span
          class="absolute left-full ml-3 px-2 py-1 text-sm text-white bg-border dark:bg-border-dark rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_4px_10px_2px_rgba(14,9,21,0.4)]"
        >
          <span
            class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-border dark:bg-border-dark rotate-45"
          ></span>
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <!-- Контакты и обратная связь внизу -->
    <div class="flex flex-col items-center gap-1 pb-2">
      <a
        href="https://t.me/JuliettaLynx"
        target="_blank"
        class="relative group flex items-center justify-center w-12 h-12 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-purple-50 dark:hover:bg-border-dark hover:text-purple-600 dark:hover:text-accent transition-colors duration-150"
      >
        <span class="text-lg">💬</span>
        <span
          class="absolute left-full ml-3 px-2 py-1 text-sm text-white bg-border dark:bg-border-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_4px_10px_2px_rgba(14,9,21,0.4)]"
        >
          <span
            class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-border dark:bg-border-dark rotate-45"
          ></span>
          Telegram
        </span>
      </a>

      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSdSlanCQfeF_4zFU9pj1IdYPxGSJBN4pGtslnWWvsdZfO4lgQ/viewform?usp=header"
        target="_blank"
        class="relative group flex items-center justify-center w-12 h-12 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-purple-50 dark:hover:bg-border-dark hover:text-purple-600 dark:hover:text-accent transition-colors duration-150"
      >
        <span class="text-lg">✉️</span>
        <span
          class="absolute left-full ml-3 px-2 py-1 text-sm text-white bg-border dark:bg-border-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_4px_10px_2px_rgba(14,9,21,0.4)]"
        >
          Есть идеи?
          <span
            class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-border dark:bg-border-dark rotate-45"
          ></span>
        </span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const onNavClick = () => {
  window.dispatchEvent(new CustomEvent("close-external-view"));
};

const navItems = [
  { path: "/library", label: "Библиотека", icon: "📚" },
  { path: "/tracker", label: "Трекер", icon: "📊" },
  { path: "/wishlist", label: "Вишлист", icon: "🎁" },
  { path: "/community", label: "Сообщество", icon: "👥" },
];
</script>
