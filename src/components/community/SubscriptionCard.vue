<template>
  <div
    class="border border-border dark:border-border-dark rounded-lg p-4 bg-white dark:bg-bg-secondary-dark"
  >
    <div class="flex justify-between items-center mb-2">
      <div class="flex min-w-0 items-center gap-3">
        <img
          :src="subscription.avatar || defaultAvatar"
          class="w-10 h-10 rounded-full object-cover"
        />
        <span class="font-bold dark:text-white text-lg inline-block truncate">{{
          subscription.displayName
        }}</span>
      </div>
      <button
        @click="confirmUnsubscribe"
        class="px-1.5 py-1.5 ml-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        <BasketIcon class="w-5 h-5" />
      </button>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <!-- Карточка библиотеки -->
      <div
        v-if="subscription?.hasLibraryAccess"
        class="ml-12 lg:ml-0 border border-border dark:border-border-dark rounded-lg p-2 bg-white dark:bg-border-dark/40 dark:text-white cursor-pointer"
        @click="$emit('open-library')"
      >
        <div class="font-medium flex gap-1 items-center text-white">
          <LibraryIcon class="w-6 h-6 scale-75 text-border/60" />Библиотека
        </div>
        <div ref="libraryContainerRef" class="hidden lg:flex gap-2 py-2 px-2">
          <div
            v-if="loadingLibrary"
            class="flex justify-center items-center w-full py-4"
          >
            <img
              src="/public/loading.png"
              alt="Loading..."
              class="w-7 h-7 animate-spin"
            />
          </div>
          <template v-else>
            <div
              v-for="book in visibleLibraryBooks"
              :key="book.id"
              class="w-14 flex-shrink-0 relative group"
              @click.stop="$emit('open-book', { book, listType: 'library' })"
            >
              <img
                :src="book.cover || defaultCover"
                class="w-full aspect-[2/3] object-cover rounded transition-transform duration-200"
              />

              <div
                class="absolute inset-0 bg-black/70 rounded flex items-center justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                <div class="text-center text-white">
                  <div class="break-words w-14 text-[11px] tracking-[-0.04em]">
                    {{ book.title }}
                  </div>
                  <div
                    v-if="book.author"
                    class="break-words w-14 text-[10px] opacity-80 font-thin"
                  >
                    {{ book.author }}
                  </div>
                </div>
              </div>
            </div>
            <div v-if="libraryBooks.length === 0" class="text-sm text-gray-500">
              Нет книг
            </div>
          </template>
        </div>
      </div>

      <!-- Карточка отсутствия доступа к библиотеке -->
      <div
        v-else
        class="ml-12 min-[700px]:ml-0 border border-border dark:border-border-dark rounded-lg p-2 bg-white dark:bg-border-dark/40 dark:text-white cursor-pointer"
      >
        <div class="font-medium flex gap-1 items-center text-white">
          <LibraryIcon class="w-6 h-6 scale-75 text-red-500" />Библиотека
        </div>
        <div class="hidden lg:flex py-2 px-2">
          <div class="text-sm text-gray-500">Нет доступа</div>
        </div>
      </div>

      <!-- Карточка вишлиста -->
      <div
        v-if="subscription?.hasWishlistAccess"
        class="ml-12 lg:ml-0 border border-border dark:border-border-dark rounded-lg p-2 bg-white dark:bg-border-dark/40 dark:text-white cursor-pointer"
        @click="$emit('open-wishlist')"
      >
        <div class="font-medium flex gap-1 items-center text-white">
          <WishlistIcon class="w-6 h-6 scale-75 text-border/60" />Вишлист
        </div>
        <div ref="wishlistContainerRef" class="hidden lg:flex gap-2 py-2 px-2">
          <div
            v-if="loadingWishlist"
            class="flex justify-center items-center w-full py-4"
          >
            <img
              src="/public/loading.png"
              alt="Loading..."
              class="w-7 h-7 animate-spin"
            />
          </div>
          <template v-else>
            <div
              v-for="book in visibleWishlistBooks"
              :key="book.id"
              class="w-14 flex-shrink-0 relative group"
              @click.stop="$emit('open-book', { book, listType: 'wishlist' })"
            >
              <img
                :src="book.cover || defaultCover"
                class="w-full aspect-[2/3] object-cover rounded transition-transform duration-200"
              />

              <div
                class="absolute inset-0 bg-black/70 rounded flex items-center justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                <div
                  class="text-center text-white text-[11px] tracking-[-0.04em]"
                >
                  <div class="break-words w-14">
                    {{ book.title }}
                  </div>
                  <div
                    v-if="book.author"
                    class="break-words w-14 text-[10px] opacity-80"
                  >
                    {{ book.author }}
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="wishlistBooks.length === 0"
              class="text-sm text-gray-500"
            >
              Нет книг
            </div>
          </template>
        </div>
      </div>

      <!-- Карточка отсутствия доступа к вишлисту -->
      <div
        v-else
        class="ml-12 lg:ml-0 border border-border dark:border-border-dark rounded-lg p-2 bg-white dark:bg-border-dark/40 dark:text-white cursor-pointer"
      >
        <div class="font-medium flex gap-1 items-center text-white">
          <WishlistIcon class="w-6 h-6 scale-75 text-red-500" />Вишлист
        </div>
        <div class="hidden lg:flex py-2 px-2">
          <div class="text-sm text-gray-500">Нет доступа</div>
        </div>
      </div>
    </div>

    <DeleteModal
      :is-open="showConfirm"
      title="Отписаться"
      :message="unsubscribeMessage"
      confirm-text="Отписаться"
      danger
      @close="showConfirm = false"
      @confirm="handleUnsubscribe"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import DeleteModal from "../DeleteModal.vue";
import { DEFAULT_AVATAR, DEFAULT_COVER } from "../../constants/constants.js";

import BasketIcon from "../../assets/icons/basket.svg?component";
import LibraryIcon from "../../assets/icons/navigation/library.svg?component";
import WishlistIcon from "../../assets/icons/navigation/wishlist.svg?component";

const props = defineProps({
  subscription: Object,
  libraryBooks: Array,
  wishlistBooks: Array,
  loadingLibrary: Boolean,
  loadingWishlist: Boolean,
});
const emit = defineEmits([
  "open-library",
  "open-wishlist",
  "unsubscribe",
  "open-book",
]);

const showConfirm = ref(false);

const defaultAvatar = DEFAULT_AVATAR;
const defaultCover = DEFAULT_COVER;

const libraryContainerRef = ref(null);
const wishlistContainerRef = ref(null);
const visibleCount = ref(10);
const resizeObserver = ref(null);

const ITEM_WIDTH = 56;
const GAP = 8;

const updateVisibleCount = () => {
  if (!libraryContainerRef.value && !wishlistContainerRef.value) return;

  const calc = (ref) => {
    if (!ref.value) return 0;
    return Math.floor(ref.value.clientWidth / (ITEM_WIDTH + GAP));
  };

  const count = Math.max(
    calc(libraryContainerRef),
    calc(wishlistContainerRef),
    1,
  );
  visibleCount.value = count;
};

onMounted(() => {
  resizeObserver.value = new ResizeObserver(() => updateVisibleCount());
  if (libraryContainerRef.value)
    resizeObserver.value.observe(libraryContainerRef.value);
  if (wishlistContainerRef.value)
    resizeObserver.value.observe(wishlistContainerRef.value);
  updateVisibleCount();
});

onBeforeUnmount(() => {
  resizeObserver.value?.disconnect();
});

watch([() => props.libraryBooks, () => props.wishlistBooks], () => {
  updateVisibleCount();
});

const visibleLibraryBooks = computed(() =>
  (props.libraryBooks || []).slice(0, visibleCount.value),
);
const visibleWishlistBooks = computed(() =>
  (props.wishlistBooks || []).slice(0, visibleCount.value),
);

// Определяем тип подписки
const subscriptionType = computed(() => {
  const sub = props.subscription;
  // Если есть доступ только к библиотеке - отписываемся от библиотеки
  if (sub.hasLibraryAccess && !sub.hasWishlistAccess) {
    return "library";
  }
  // Если есть доступ только к вишлисту - отписываемся от вишлиста
  if (sub.hasWishlistAccess && !sub.hasLibraryAccess) {
    return "wishlist";
  }
  // Если есть доступ к обоим или ни к одному - общая отписка (null)
  return null;
});

const unsubscribeMessage = computed(() => {
  const name = props.subscription.displayName;
  const type = subscriptionType.value;

  if (type === "library") {
    return `Вы уверены, что хотите отписаться от библиотеки ${name}?`;
  } else if (type === "wishlist") {
    return `Вы уверены, что хотите отписаться от вишлиста ${name}?`;
  } else {
    return `Вы уверены, что хотите отписаться от ${name}?`;
  }
});

// Открытие модального окна подтверждения перед отпиской
const confirmUnsubscribe = () => {
  showConfirm.value = true;
};

// Обработчик подтверждения отписки
const handleUnsubscribe = () => {
  emit("unsubscribe", props.subscription.userId, subscriptionType.value);
};
</script>
