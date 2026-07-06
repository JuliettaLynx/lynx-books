<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
      >
        <!-- Заголовок -->
        <div
          class="flex-shrink-0 border-b border-border dark:border-border-dark p-4 flex justify-between items-center"
        >
          <h2 class="text-lg font-semibold dark:text-white">
            {{
              isLibrary ? "Информация о книге" : "Информация о книге (вишлист)"
            }}
          </h2>
          <button
            @click="close"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div class="flex gap-4">
            <!-- Левая колонка: обложка -->
            <div class="relative h-full">
              <div
                v-if="book?.priority && book.priority > 0"
                class="absolute right-1 top-1 z-10 bg-accent/50 text-white dark:text-black rounded-lg w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                {{ book.priority }}
              </div>
              <div class="flex-shrink-0 w-28">
                <img
                  :src="book?.cover || defaultCover"
                  class="w-full aspect-[2/3] object-cover rounded-lg border border-border dark:border-border-dark"
                  alt="Обложка"
                />
              </div>
            </div>
            <!-- Правая колонка: название, автор, издательство -->
            <div class="flex-1 space-y-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Название</label
                >
                <p class="text-gray-900 dark:text-white">
                  {{ book?.title || "—" }}
                </p>
              </div>
              <div v-if="book?.author">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Автор</label
                >
                <p class="text-gray-900 dark:text-white">{{ book.author }}</p>
              </div>
              <div v-if="book?.publisher">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Издательство</label
                >
                <p class="text-gray-900 dark:text-white">
                  {{ book.publisher }}
                </p>
              </div>
            </div>
          </div>

          <!-- Нижняя часть – остальные поля -->
          <div class="mt-4 space-y-4">
            <!-- Библиотека -->
            <template v-if="isLibrary">
              <div v-if="book?.format">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Формат</label
                >
                <p class="text-gray-900 dark:text-white">{{ book.format }}</p>
              </div>
              <div v-if="book?.status">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Статус</label
                >
                <p class="text-gray-900 dark:text-white">{{ book.status }}</p>
              </div>
              <div v-if="book?.rating && book.rating > 0">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Рейтинг</label
                >
                <div class="text-yellow-400 text-lg">
                  <span v-for="n in 5" :key="n">{{
                    n <= (book.rating || 0) ? "★" : "☆"
                  }}</span>
                </div>
              </div>
              <div v-if="book?.review">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Отзыв</label
                >
                <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {{ book.review }}
                </p>
              </div>
            </template>

            <!-- Вишлист -->
            <template v-else>
              <div v-if="book?.binding">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Переплёт</label
                >
                <p class="text-gray-900 dark:text-white">{{ book.binding }}</p>
              </div>
              <div v-if="book?.note">
                <label
                  class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Заметка</label
                >
                <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {{ book.note }}
                </p>
              </div>
            </template>

            <div v-if="book?.description">
              <label
                class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                >Аннотация</label
              >
              <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                {{ book.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { DEFAULT_COVER } from "../../constants/constants.js";

const defaultCover = DEFAULT_COVER;

const props = defineProps({
  isOpen: Boolean,
  book: Object,
  listType: String, // 'library' или 'wishlist'
});
const emit = defineEmits(["close"]);

const isLibrary = computed(() => props.listType === "library");

const close = () => emit("close");
</script>
