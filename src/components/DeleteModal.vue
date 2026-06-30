<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[70] p-4"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-bg-secondary-dark w-full max-w-sm rounded-2xl p-6"
      >
        <h3 class="text-lg font-semibold mb-2 dark:text-white">{{ title }}</h3>
        <p v-if="message" class="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {{ message }}
        </p>
        <div class="flex gap-3">
          <button
            @click="close"
            class="flex-1 py-2 px-3 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg hover:bg-purple-700/10 dark:hover:bg-border-dark dark:text-white transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            @click="confirm"
            :class="[
              'flex-1 py-2 px-3 rounded-lg transition-colors',
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-accent hover:bg-accent/80 text-white dark:text-border-dark',
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: "Подтверждение" },
  message: { type: String, default: "" },
  confirmText: { type: String, default: "Удалить" },
  cancelText: { type: String, default: "Отмена" },
  danger: { type: Boolean, default: true }, // красная кнопка или нет
});

const emit = defineEmits(["confirm", "close"]);

const close = () => emit("close");
const confirm = () => emit("confirm");
</script>
