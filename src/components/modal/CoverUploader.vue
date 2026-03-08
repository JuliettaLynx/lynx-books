<template>
  <div class="flex-shrink-0">
    <div class="relative">
      <div
        class="w-28 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600"
        @click="triggerFileInput"
      >
        <img
          v-if="coverPreview"
          :src="coverPreview"
          class="w-full h-full object-cover"
          alt="Обложка"
        />
        <span v-else>📷</span>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <button
        v-if="coverPreview"
        type="button"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
        @click="$emit('remove')"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  coverPreview: String,
  coverFile: [String, File],
});

const emit = defineEmits(["update:coverPreview", "update:coverFile", "remove"]);

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      emit("update:coverPreview", e.target.result);
      emit("update:coverFile", e.target.result);
    };
    reader.readAsDataURL(file);
  }
};
</script>
