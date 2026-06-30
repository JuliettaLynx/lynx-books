<template>
  <div
    class="border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark cursor-pointer rounded-lg dark:text-white relative min-h-36"
    :class="[isGrid ? 'flex' : '']"
    @click="handleCardClick"
  >
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
          <p
            class="text-base leading-5 text-gray-800 dark:text-gray-200 line-clamp-3"
          >
            {{ book.title || "—" }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ book.author || "—" }}
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

const emit = defineEmits(["edit", "favorite", "delete", "click"]);

const handleCardClick = () => {
  emit("click", props.book);
};

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
