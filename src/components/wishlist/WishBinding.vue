<template>
  <div>
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      Переплёт</label
    >
    <div class="flex gap-4">
      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'твёрдый'"
          value="твёрдый"
          class="mr-2"
          @change="$emit('update:modelValue', 'твёрдый')"
        />
        <span class="text-sm dark:text-gray-300">Твёрдый</span>
      </label>

      <label class="flex items-center">
        <input
          type="radio"
          :checked="modelValue === 'мягкий'"
          value="мягкий"
          class="mr-2"
          @change="$emit('update:modelValue', 'мягкий')"
        />
        <span class="text-sm dark:text-gray-300">Мягкий</span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
});

defineEmits(["update:modelValue"]);
</script>
