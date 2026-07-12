<template>
  <div
    class="h-full border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark cursor-pointer rounded-lg dark:text-white relative min-h-36"
    :class="[isGrid ? 'flex' : '']"
  >
    <!-- Иконка избранного для библиотеки -->
    <div
      v-if="readonly && isLibrary && book.isFavorite"
      class="absolute top-2 right-1 z-10 text-red-500 text-lg"
    >
      <FavoriteIcon class="w-6 h-6 min-[500px]:scale-125" />
    </div>

    <!-- Иконка приоритета для вишлиста -->
    <div
      v-if="readonly && !isLibrary && book.priority"
      class="absolute top-1 right-2 z-10 bg-accent/50 text-white dark:text-black rounded-lg w-6 h-6 flex items-center justify-center text-xs font-bold"
    >
      {{ book.priority }}
    </div>

    <!-- Обложка -->
    <div
      class="bg-purple-100 dark:bg-border-dark flex-shrink-0 relative overflow-hidden"
      :class="
        isGrid
          ? 'w-24 rounded-l-lg'
          : 'h-64 rounded-t-lg max-[390px]:h-60 max-[370px]:h-56 max-[360px]:h-52 max-[340px]:h-48 max-[310px]:h-44'
      "
    >
      <!-- Размытый фон (только если есть обложка) -->
      <div
        v-if="book.cover"
        class="absolute z-0 inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${book.cover})` }"
      >
        <div class="absolute inset-0 backdrop-blur-md"></div>
      </div>

      <!-- Формат и статус (только для плиточного расположения, поверх обложки, слева снизу) -->
      <div
        v-if="!isGrid && isLibrary"
        class="absolute flex flex-col gap-1 min-[500px]:gap-2 z-10 bottom-1 left-1 py-1 min-[500px]:py-2 text-black dark:text-white rounded-lg bg-bg-primary-dark/70 border border-border-dark"
      >
        <span class="px-1 min-[500px]:px-1.5">
          <component
            :is="getFormatIcon(book.format)"
            class="w-5 h-5 min-[500px]:scale-125"
          />
        </span>
        <span class="px-1 min-[500px]:px-1.5">
          <component
            :is="getStatusIcon(book.status)"
            class="w-5 h-5 min-[500px]:scale-125"
          />
        </span>
      </div>

      <div
        class="h-full relative z-0 flex items-center justify-center text-4xl"
      >
        <img v-if="book.cover" :src="book.cover" class="h-full" alt="Обложка" />
        <img v-else :src="defaultCover" />
      </div>
    </div>

    <!-- Информация о книге -->
    <div class="px-2 flex-1 relative">
      <div class="flex justify-between">
        <div
          class="flex-1 py-1"
          :class="!isLibrary && isGrid ? 'pt-8' : isGrid ? 'pt-4' : 'pt-2'"
        >
          <p
            class="text-base max-[400px]:text-sm text-center leading-5 text-gray-800 dark:text-gray-200 line-clamp-3"
          >
            {{ book.title || "—" }}
          </p>
          <p
            class="text-sm max-[400px]:text-xs text-center text-gray-500 dark:text-gray-400"
          >
            {{ book.author || "—" }}
          </p>
          <p
            class="text-sm max-[400px]:text-xs text-center text-gray-500 dark:text-gray-400"
          >
            {{ book.publisher }}
          </p>

          <!-- Формат и статус (только для списка) -->
          <div
            v-if="isGrid && isLibrary"
            class="pt-3 flex justify-center items-center"
          >
            <span
              class="flex gap-3 text-xs justify-center items-center py-1.5 rounded-lg w-20"
            >
              <component
                :is="getFormatIcon(book.format)"
                class="w-5 h-5 min-[500px]:scale-125"
              />
              <component
                :is="getStatusIcon(book.status)"
                class="w-5 h-5 min-[500px]:scale-125"
              />
            </span>
          </div>

          <!-- Рейтинг (только для прочитанных) -->
          <div
            v-if="book.status === 'прочитано' && book.rating !== 0 && !isGrid"
            class="text-yellow-400 dark:text-yellow-500 text-center"
          >
            <span v-for="n in 5" :key="n" class="text-xl">
              {{ n <= (book.rating || 0) ? "★" : "☆" }}
            </span>
          </div>
        </div>

        <div
          v-if="book.status === 'прочитано' && book.rating !== 0 && isGrid"
          class="pr-0 pt-7 text-yellow-400 dark:text-yellow-500 flex flex-col"
        >
          <span v-for="n in 5" :key="n" class="text-xl leading-5">
            {{ n <= (book.rating || 0) ? "★" : "☆" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import BookActions from "../library/BookActions.vue";
import { DEFAULT_COVER } from "../../constants/constants.js";

import FavoriteIcon from "../../assets/icons/bookcard/favorite.svg?component";
import Paper from "../../assets/icons/bookcard/paper.svg?component";
import Electronic from "../../assets/icons/bookcard/electronic.svg?component";
import Audio from "../../assets/icons/bookcard/audio.svg?component";

import FinishedIcon from "../../assets/icons/bookcard/finished.svg?component";
import UnfinishedIcon from "../../assets/icons/bookcard/unfinished.svg?component";
import AbandonedIcon from "../../assets/icons/bookcard/abandoned.svg?component";

const defaultCover = DEFAULT_COVER;

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  isGrid: {
    type: Boolean,
    default: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  listType: {
    type: String,
    default: "library",
  },
});

defineEmits(["edit", "favorite", "delete"]);

const isLibrary = computed(() => props.listType === "library");

// Функция для получения эмодзи в зависимости от формата
const getFormatEmoji = (format) => {
  const formatMap = {
    бумажная: "📖",
    электронная: "📱",
    аудио: "🎧",
  };

  return formatMap[format];
};

const getFormatIcon = (format) => {
  const formatMap = {
    бумажная: Paper,
    электронная: Electronic,
    аудио: Audio,
  };
  return formatMap[format] || Paper;
};

const getStatusIcon = (status) => {
  const formatMap = {
    прочитано: FinishedIcon,
    "не прочитано": UnfinishedIcon,
    брошено: AbandonedIcon,
  };
  return formatMap[status] || UnfinishedIcon;
};
</script>
