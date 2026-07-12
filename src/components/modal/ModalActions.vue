<template>
  <div class="flex-shrink-0 border-t border-border dark:border-border-dark p-4">
    <div class="flex gap-2">
      <button
        v-if="isEdit"
        type="button"
        @click="$emit('delete')"
        class="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300/30 dark:border-red-500/30 rounded-lg transition-colors"
      >
        <BasketIcon class="w-5 h-5" />
      </button>
      <button
        type="button"
        @click="$emit('submit')"
        class="flex-1 py-2 px-4 bg-accent/60 hover:bg-accent/80 text-black/70 dark:text-white rounded-lg transition-colors"
      >
        {{ isEdit ? "Сохранить" : "Добавить" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import BasketIcon from "../../assets/icons/basket.svg?component";

defineProps({
  isEdit: Boolean,
});

defineEmits(["submit", "delete"]);
</script>
