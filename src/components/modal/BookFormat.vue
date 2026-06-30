<template>
  <div class="mt-4">
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Формат
    </label>
    <div class="flex gap-2" :class="{ 'flex-col gap-2': isNarrow }">
      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'бумажная'"
          value="бумажная"
          class="mr-2"
          @change="$emit('update:modelValue', 'бумажная')"
        />
        <span class="text-sm dark:text-gray-300">Бумажная</span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'электронная'"
          value="электронная"
          class="mr-2"
          @change="$emit('update:modelValue', 'электронная')"
        />
        <span class="text-sm dark:text-gray-300">Электронная</span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'аудио'"
          value="аудио"
          class="mr-2"
          @change="$emit('update:modelValue', 'аудио')"
        />
        <span class="text-sm dark:text-gray-300">Аудио</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "бумажная",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isNarrow = ref(false);

const checkWidth = () => {
  isNarrow.value = window.innerWidth < 330;
};

onMounted(() => {
  checkWidth();
  window.addEventListener("resize", checkWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkWidth);
});
</script>
