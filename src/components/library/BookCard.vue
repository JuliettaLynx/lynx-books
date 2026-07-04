<template>
  <div
    class="border border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark cursor-pointer rounded-lg dark:text-white relative min-h-36"
    :class="[isGrid ? 'flex' : '']"
    @click="handleCardClick"
  >
    <div v-if="!isGrid" class="absolute top-1 right-2 z-10 h-6">
      <BookActions
        :book="book"
        :is-grid="isGrid"
        @favorite="$emit('favorite', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
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
      <div v-if="!isGrid" class="absolute z-10 bottom-2 left-2">
        <span
          class="text-xs px-2 py-1 rounded-lg text-black dark:text-white"
          :class="{
            'bg-green-300/80 dark:bg-green-800/80': book.status === 'прочитано',
            'bg-yellow-300/80 dark:bg-yellow-800/80':
              book.status === 'не прочитано',
            'bg-red-300/80 dark:bg-red-800/80': book.status === 'брошено',
          }"
        >
          <span class="text-xs py-1 dark:text-gray-300">
            <span>{{ getFormatEmoji(book.format) }}</span>
          </span>
          {{ book.status }}
        </span>
      </div>

      <div
        class="h-full relative z-0 flex items-center justify-center text-4xl"
      >
        <img v-if="book.cover" :src="book.cover" class="h-full" alt="Обложка" />
        <span v-else>📷</span>
      </div>
    </div>

    <!-- Информация о книге -->
    <div class="px-2 flex-1 relative">
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
          <div v-if="isGrid" class="pt-3 text-center">
            <span
              class="text-xs px-2 py-1 rounded-lg"
              :class="{
                'bg-green-300/80 dark:bg-green-800/80':
                  book.status === 'прочитано',
                'bg-yellow-300/80 dark:bg-yellow-800/80':
                  book.status === 'не прочитано',
                'bg-red-300/80 dark:bg-red-800/80': book.status === 'брошено',
              }"
            >
              <span class="text-sm pr-1">
                <span>{{ getFormatEmoji(book.format) }}</span>
              </span>
              {{ book.status }}
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

        <div
          v-if="book.status === 'прочитано' && book.rating !== 0 && isGrid"
          class="text-yellow-400 dark:text-yellow-500 flex flex-col absolute pt-2"
        >
          <span v-for="n in 5" :key="n" class="text-lg leading-6">
            {{ n <= (book.rating || 0) ? "★" : "☆" }}
          </span>
        </div>

        <!-- Действия с книгой (для карточек) -->
        <div v-if="isGrid">
          <BookActions
            :book="book"
            :is-grid="isGrid"
            @favorite="$emit('favorite', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BookActions from "./BookActions.vue";

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
const getFormatEmoji = (format) => {
  const formatMap = {
    бумажная: "📖",
    электронная: "📱",
    аудио: "🎧",
  };

  return formatMap[format] || "📚";
};
</script>
