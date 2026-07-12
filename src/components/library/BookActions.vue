<template>
  <div class="relative" @click.stop v-click-outside="closeMenu">
    <button
      @click="handleAction('favorite')"
      class="p-1 min-[500px]:p-1.5 rounded-lg text-center transition-colors bg-bg-primary-dark/70 border border-border-dark"
      :class="book.isFavorite ? 'text-red-500' : 'text-gray-400'"
    >
      <FavoriteIcon class="w-5 h-5 min-[500px]:scale-125" />
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import FavoriteIcon from "../../assets/icons/bookcard/favorite.svg?component";

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
