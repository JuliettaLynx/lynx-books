<template>
  <div
    class="border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark cursor-pointer rounded-lg dark:text-white relative"
    :class="[isGrid ? 'flex' : '']"
  >
    <!-- Три точки для плитки -->
    <div v-if="!isGrid" class="absolute top-1 right-2 z-10">
      <button @click.stop="toggleMenu" class="text-2xl font-black leading-5">
        ⋯
      </button>
      <div
        v-if="menuOpen"
        ref="menuRef"
        class="absolute right-0 top-full mt-1 bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-20 min-w-[120px]"
      >
        <button
          @click="handleEdit"
          class="w-full px-4 py-2 text-left border-b border-border dark:border-border-dark hover:bg-purple-400/10 dark:hover:bg-border-dark/50 flex items-center gap-1 dark:text-gray-300"
        >
          <span class="w-5 text-center">✎</span> Редактировать
        </button>
        <button
          @click="handleDelete"
          class="w-full px-4 py-2 text-left hover:bg-purple-400/10 dark:hover:bg-border-dark/50 flex items-center gap-1 text-red-600 dark:text-red-400"
        >
          <span class="w-5 text-center">🗑</span> Удалить
        </button>
      </div>
    </div>

    <!-- Обложка -->
    <div
      class="bg-purple-100 dark:bg-border-dark flex-shrink-0 relative overflow-hidden"
      :class="isGrid ? 'w-24 rounded-l-lg' : 'h-60 rounded-t-lg'"
    >
      <div
        v-if="book.cover"
        class="absolute z-0 inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${book.cover})` }"
      >
        <div class="absolute inset-0 backdrop-blur-md"></div>
      </div>

      <div
        class="h-full relative z-0 flex items-center justify-center text-4xl"
      >
        <img v-if="book.cover" :src="book.cover" class="h-full" alt="Обложка" />
        <span v-else>📷</span>
      </div>
    </div>

    <!-- Информация -->
    <div class="px-2 py-3 flex-1 relative">
      <div class="flex justify-between">
        <div class="flex-1 pr-1">
          <p class="text-xs leading-3 text-gray-500 dark:text-gray-400">
            {{ book.author }}
          </p>
          <p
            class="text-sm leading-5 font-medium text-gray-800 dark:text-gray-200 tracking-tight line-clamp-3"
          >
            {{ book.title }}
          </p>
          <p
            v-if="book.publisher"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            {{ book.publisher }}
          </p>

          <!-- Шесть кнопок приоритета (для обоих режимов) -->
          <div class="flex gap-1 mt-2">
            <button
              v-for="p in 5"
              :key="p"
              @click.stop="$emit('updatePriority', book.id, p)"
              class="w-4 h-4 min-[340px]:w-5 min-[340px]:h-5 min-[385px]:w-6 min-[385px]:h-6 min-[425px]:w-7 min-[425px]:h-7 rounded-lg text-xs font-bold transition-all"
              :class="getPriorityClass(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <!-- Действия для сетки -->
        <div v-if="isGrid" class="flex flex-col gap-1">
          <button
            @click.stop="handleEdit"
            class="p-1 hover:bg-purple-700/10 dark:hover:bg-border-dark rounded-lg transition-colors dark:text-gray-400"
          >
            <span class="text-lg">✎</span>
          </button>
          <button
            @click.stop="handleDelete"
            class="p-1 hover:bg-purple-700/10 dark:hover:bg-border-dark rounded-lg transition-colors dark:text-gray-400"
          >
            <span class="text-base">🗑</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  isGrid: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["edit", "delete", "updatePriority"]);

const menuOpen = ref(false);
const menuRef = ref(null);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const handleEdit = () => {
  menuOpen.value = false;
  emit("edit", props.book);
};

const handleDelete = () => {
  menuOpen.value = false;
  emit("delete", props.book);
};

// Закрытие меню по клику вне
onClickOutside(menuRef, () => (menuOpen.value = false));

const getPriorityClass = (p) => {
  const isActive = props.book.priority === p;
  const base =
    " text-gray-600 dark:text-gray-100 border border-border dark:border-border-dark";
  const activeClass = "bg-accent/40";
  const inactiveClass = "dark:bg-border-dark/40";
  return `${base} ${isActive ? activeClass : inactiveClass}`;
};
</script>
