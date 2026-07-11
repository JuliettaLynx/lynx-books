<template>
  <div class="relative w-full">
    <SearchIcon
      class="absolute left-2 top-1/2 transform -translate-y-1/2 flex w-5 h-5 ml-1 text-border-dark/40 dark:text-border/40"
    />
    <input
      type="text"
      :value="modelValue"
      autocomplete="off"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="w-full pl-10 pr-4 py-1.5 border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark font-light text-bg-primary-dark dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 placeholder:text-border-dark/40 dark:placeholder:text-border/40"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-border-dark/40 dark:text-border/40"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
import SearchIcon from "../../assets/icons/search.svg?component";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Поиск...",
  },
});

defineEmits(["update:modelValue"]);
</script>
