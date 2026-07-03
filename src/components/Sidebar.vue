<template>
  <div
    class="fixed inset-y-0 left-0 z-50 w-72 bg-white/90 dark:bg-bg-secondary-dark/90 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-border dark:border-border-dark flex flex-col"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Заголовок меню -->
    <div
      class="border-b pt-3 pb-4 border-border dark:border-border-dark flex justify-center"
    >
      <h2 class="text-lg tracking-wider font-bold dark:text-white">Меню</h2>
    </div>

    <!-- Навигация -->
    <nav class="flex-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 pt-3 pb-2.5 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-border-dark transition-colors duration-150"
        :class="{
          'bg-purple-100 dark:bg-accent/20 text-purple-700 dark:text-accent font-semibold':
            $route.path === item.path,
        }"
        @click="emit('close')"
      >
        <span class="text-lg">{{ item.icon }}</span>
        <span class="text-base">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Контакты и обратная связь внизу -->
    <div class="p-4 border-t border-border dark:border-border-dark space-y-3">
      <div
        class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
      >
        Контакты
      </div>
      <a
        href="https://t.me/example"
        target="_blank"
        class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-border-dark rounded-lg transition-colors duration-150"
      >
        <span>💬 Telegram</span>
      </a>

      <a
        href="https://t.me/example"
        target="_blank"
        class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-accent/20 hover:bg-purple-50 dark:hover:bg-border-dark rounded-lg transition-colors duration-150"
      >
        <span>✉️ Есть идеи?</span>
      </a>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const navItems = [
  { path: "/library", label: "Библиотека", icon: "📚" },
  { path: "/tracker", label: "Трекер", icon: "📊" },
  { path: "/wishlist", label: "Вишлист", icon: "🎁" },
  { path: "/community", label: "Сообщество", icon: "👥" },
];
</script>
