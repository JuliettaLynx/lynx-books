<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      :checked="modelValue"
      class="hidden"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span
      class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
      :class="[
        modelValue
          ? 'bg-accent border-accent'
          : 'bg-white dark:bg-transparent border-gray-400 dark:border-gray-500',
      ]"
    >
      <span v-if="modelValue" class="text-white text-sm leading-none">✓</span>
    </span>
    <span class="text-gray-700 dark:text-gray-300">
      <slot />
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
});
defineEmits(["update:modelValue"]);
</script>
