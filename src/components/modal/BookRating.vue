<template>
  <div class="mt-4">
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Оценка
    </label>
    <div class="flex gap-1 text-2xl">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        @click="$emit('update:modelValue', n)"
        class="focus:outline-none transition-transform hover:scale-110"
        :class="
          n <= modelValue
            ? 'text-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        "
      >
        ★
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Number,
});

defineEmits(["update:modelValue"]);
</script>
