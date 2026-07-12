<template>
  <div
    class="border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark cursor-pointer rounded-lg dark:text-white relative min-h-36"
    :class="[isGrid ? 'flex' : '']"
    @click="handleCardClick"
  >
    <div v-if="!isGrid" class="absolute top-1 right-1 z-10 h-6">
      <BookActions
        :book="book"
        :is-grid="isGrid"
        @favorite="$emit('favorite', $event)"
      />
    </div>

    <!-- Обложка -->
    <div
      class="bg-purple-100 dark:bg-border-dark/50 flex-shrink-0 relative overflow-hidden"
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
        v-if="!isGrid"
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
        <span v-else>
          <CameraIcon
            class="w-14 h-14 text-border-dark/40 dark:text-border/40"
          />
        </span>
      </div>
    </div>

    <!-- Информация о книге -->
    <div class="flex-1 relative">
      <div class="flex justify-between">
        <div class="flex-1 py-1" :class="isGrid ? 'pt-4' : 'pt-2'">
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
          <div v-if="isGrid" class="pt-3 flex justify-center items-center">
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

          <div
            v-if="book.status === 'прочитано' && book.rating !== 0 && !isGrid"
            class="text-yellow-400 dark:text-yellow-500 text-center"
          >
            <span v-for="n in 5" :key="n" class="text-lg">
              {{ n <= (book.rating || 0) ? "★" : "☆" }}
            </span>
          </div>
        </div>

        <!-- Действия с книгой (для карточек) -->
        <div v-if="isGrid" class="pt-1 pr-1">
          <BookActions
            :book="book"
            :is-grid="isGrid"
            @favorite="$emit('favorite', $event)"
          />
          <div
            v-if="book.status === 'прочитано' && book.rating !== 0 && isGrid"
            class="text-yellow-400 dark:text-yellow-500 flex flex-col items-center"
          >
            <span v-for="n in 5" :key="n" class="text-lg leading-5">
              {{ n <= (book.rating || 0) ? "★" : "☆" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BookActions from "./BookActions.vue";
import CameraIcon from "../../assets/icons/bookcard/camera.svg?component";
import FavoriteIcon from "../../assets/icons/bookcard/favorite.svg?component";

import Paper from "../../assets/icons/bookcard/paper.svg?component";
import Electronic from "../../assets/icons/bookcard/electronic.svg?component";
import Audio from "../../assets/icons/bookcard/audio.svg?component";

import FinishedIcon from "../../assets/icons/bookcard/finished.svg?component";
import UnfinishedIcon from "../../assets/icons/bookcard/unfinished.svg?component";
import AbandonedIcon from "../../assets/icons/bookcard/abandoned.svg?component";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  isGrid: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["edit", "favorite", "delete", "click"]);

const handleCardClick = () => {
  emit("click", props.book);
};

// Функция для получения эмодзи в зависимости от формата
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
