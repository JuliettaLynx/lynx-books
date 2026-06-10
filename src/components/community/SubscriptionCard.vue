<template>
  <div
    class="border border-border dark:border-border-dark rounded-lg p-4 bg-white dark:bg-bg-secondary-dark"
  >
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <img
          :src="subscription.avatar || defaultAvatar"
          class="w-10 h-10 rounded-full object-cover"
        />
        <span class="font-bold dark:text-white text-lg">{{
          subscription.displayName
        }}</span>
      </div>
      <button
        @click="confirmUnsubscribe"
        class="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Отписаться
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Карточка библиотеки -->
      <div
        v-if="subscription.hasLibraryAccess"
        class="border border-border dark:border-border-dark rounded-lg p-2 bg-white dark:bg-border-dark/40 dark:text-white cursor-pointer"
        @click="$emit('open-library')"
      >
        <div class="font-medium mb-2 flex justify-between items-center">
          <span>📚 Библиотека</span>
        </div>
        <div class="flex gap-2 overflow-x-auto py-2 px-2">
          <div
            v-for="book in libraryBooks.slice(0, 4)"
            :key="book.id"
            class="w-16 flex-shrink-0"
          >
            <img
              :src="book.cover || defaultCover"
              class="w-full aspect-[2/3] object-cover rounded transition-transform duration-200"
            />
          </div>
          <div v-if="libraryBooks.length === 0" class="text-sm text-gray-500">
            Нет книг
          </div>
        </div>
      </div>

      <!-- Карточка вишлиста -->
      <div
        v-if="subscription.hasWishlistAccess"
        class="border border-border dark:border-border-dark rounded-lg p-2 bg-white dark:bg-border-dark/40 dark:text-white cursor-pointer"
        @click="$emit('open-wishlist')"
      >
        <div class="font-medium mb-2 flex justify-between items-center">
          <span>⭐ Вишлист</span>
        </div>
        <div class="flex gap-2 overflow-x-auto py-2 px-2">
          <div
            v-for="book in wishlistBooks.slice(0, 4)"
            :key="book.id"
            class="w-16 flex-shrink-0"
          >
            <img
              :src="book.cover || defaultCover"
              class="w-full aspect-[2/3] object-cover rounded transition-transform duration-200"
            />
          </div>
          <div v-if="wishlistBooks.length === 0" class="text-sm text-gray-500">
            Нет книг
          </div>
        </div>
      </div>
    </div>

    <DeleteModal
      :is-open="showConfirm"
      title="Отписаться"
      :message="`Вы уверены, что хотите отписаться от ${subscription.displayName}?`"
      confirm-text="Отписаться"
      danger
      @close="showConfirm = false"
      @confirm="handleUnsubscribe"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import DeleteModal from "../DeleteModal.vue";
import { DEFAULT_AVATAR, DEFAULT_COVER } from "../../constants/constants.js";

const props = defineProps({
  subscription: Object,
  libraryBooks: Array,
  wishlistBooks: Array,
});
const emit = defineEmits(["open-library", "open-wishlist", "unsubscribe"]);

const showConfirm = ref(false);

const defaultAvatar = DEFAULT_AVATAR;
const defaultCover = DEFAULT_COVER;

// Открытие модального окна подтверждения перед отпиской
const confirmUnsubscribe = () => {
  showConfirm.value = true;
};

// Обработчик подтверждения отписки
const handleUnsubscribe = () => {
  emit("unsubscribe", props.subscription.userId);
};
</script>
