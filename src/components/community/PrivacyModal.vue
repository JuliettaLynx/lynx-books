<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl p-6"
      >
        <h2 class="text-xl font-bold mb-4 dark:text-white">
          Настройки приватности
        </h2>
        <div class="space-y-3">
          <label class="flex items-center justify-between">
            <span class="dark:text-gray-300">Библиотека публична</span>
            <CustomCheckbox
              v-model="localPrivacy.isLibraryPublic"
            ></CustomCheckbox>
          </label>
          <label class="flex items-center justify-between">
            <span class="dark:text-gray-300">Вишлист публичен</span>
            <CustomCheckbox
              v-model="localPrivacy.isWishlistPublic"
            ></CustomCheckbox>
          </label>
        </div>
        <div class="flex gap-2 mt-6">
          <button
            @click="close"
            class="flex-1 py-2 px-3 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg hover:bg-purple-700/10 dark:hover:bg-border-dark dark:text-white transition-colors"
          >
            Отмена
          </button>
          <button
            @click="save"
            class="flex-1 py-2 px-3 rounded-lg bg-accent hover:bg-accent/80 text-white dark:text-border-dark"
          >
            Сохранить
          </button>
        </div>
        <div v-if="saveError" class="mt-3 text-red-500 text-sm">
          {{ saveError }}
        </div>
        <div v-if="saveSuccess" class="mt-3 text-green-500 text-sm">
          {{ saveSuccess }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import { useCommunityStore } from "../../stores/community";
import CustomCheckbox from "../CustomCheckbox.vue";

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue"]);

const communityStore = useCommunityStore();

const localPrivacy = ref({ ...communityStore.privacy });
const saveError = ref("");
const saveSuccess = ref("");

const close = () => emit("update:modelValue", false);

const save = async () => {
  saveError.value = "";
  saveSuccess.value = "";
  try {
    await communityStore.updatePrivacy(localPrivacy.value);
    saveSuccess.value = "Настройки сохранены";
    setTimeout(close, 1000);
  } catch (err) {
    saveError.value = err.message || "Ошибка сохранения";
  }
};

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await communityStore.loadPrivacy();
      localPrivacy.value = { ...communityStore.privacy };
      saveError.value = "";
      saveSuccess.value = "";
    }
  },
);
</script>

<style scoped>
.toggle {
  width: 40px;
  height: 20px;
  appearance: none;
  background: #ccc;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
}
.toggle:checked {
  background: #3b82f6;
}
.toggle::before {
  content: "";
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: 0.2s;
}
.toggle:checked::before {
  left: 22px;
}
</style>
