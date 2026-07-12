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
        <h2 class="text-xl font-bold mb-4 dark:text-white">Поделиться</h2>
        <div class="space-y-3 flex flex-col">
          <p class="font-medium dark:text-white">Чем вы хотите поделиться?</p>
          <CustomCheckbox v-model="shareLibrary">Библиотека</CustomCheckbox>
          <CustomCheckbox v-model="shareWishlist">Вишлист</CustomCheckbox>
        </div>

        <button
          @click="generateLink"
          :disabled="!shareLibrary && !shareWishlist"
          class="mt-4 w-full py-2 rounded-lg bg-accent hover:bg-accent/80 text-white dark:text-border-dark disabled:opacity-50"
        >
          Создать ссылку
        </button>

        <div v-if="generatedLink" class="mt-4">
          <div class="flex gap-2">
            <input
              type="text"
              :value="generatedLink"
              readonly
              class="flex-1 p-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg hover:bg-purple-700/10 dark:hover:bg-border-dark dark:text-white transition-colors"
            />
            <button
              @click="copyLink"
              class="w-9 py-2 pl-1 text-xl dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg hover:bg-purple-700/10 dark:hover:bg-border-dark"
              title="Копировать"
            >
              <CopyIcon class="w-6 h-6 text-white" />
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Ссылка действительна 7 дней, одноразовая
          </p>
        </div>

        <div v-if="shareError" class="mt-2 text-red-500 text-sm">
          {{ shareError }}
        </div>
        <div v-if="copySuccess" class="mt-2 text-green-500 text-sm">
          {{ copySuccess }}
        </div>

        <button
          @click="close"
          class="mt-4 w-full py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg hover:bg-purple-700/10 dark:hover:bg-border-dark dark:text-white transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";
import { useCommunityStore } from "../../stores/community";
import CustomCheckbox from "../CustomCheckbox.vue";
import CopyIcon from "../../assets/icons/community/copy.svg?component";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

const communityStore = useCommunityStore();

const shareLibrary = ref(true);
const shareWishlist = ref(false);
const generatedLink = ref("");
const shareError = ref("");
const copySuccess = ref("");

const close = () => {
  emit("update:modelValue", false);
  generatedLink.value = "";
  shareError.value = "";
  copySuccess.value = "";
  shareLibrary.value = true;
  shareWishlist.value = false;
};

const generateLink = async () => {
  if (!shareLibrary.value && !shareWishlist.value) return;
  shareError.value = "";
  try {
    const result = await communityStore.generateShareLink(
      shareLibrary.value,
      shareWishlist.value,
    );
    generatedLink.value = result.link;
  } catch (err) {
    shareError.value = err.message || "Ошибка генерации ссылки";
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(generatedLink.value);
    copySuccess.value = "Скопировано!";
    setTimeout(() => (copySuccess.value = ""), 2000);
  } catch {
    alert("Не удалось скопировать");
  }
};
</script>
