<template>
  <div class="relative" @click.stop v-click-outside="closeMenu">
    <!-- Кнопка избранного -->
    <div class="flex flex-col gap-1">
      <button
        @click="handleAction('favorite')"
        class="p-1 rounded-lg transition-colors"
        :class="book.isFavorite ? 'text-red-500' : 'text-gray-400'"
      >
        <span class="text-3xl">♥</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Директива для отслеживания кликов вне элемента
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function (event) {
      // Проверяем, был ли клик вне элемента и его дочерних элементов
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

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

const emit = defineEmits(["favorite", "edit"]);

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleAction = (action) => {
  emit(action, props.book);
  isOpen.value = false;
};
</script>
