<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed pb-14 lg:pb-0 inset-0 bg-black bg-opacity-90 z-40 overflow-auto"
    >
      <div class="relative w-full">
        <!-- Шапка с заголовком и кнопкой закрытия -->
        <div
          class="sticky px-3 top-0 z-20 bg-white dark:bg-bg-primary-dark text-black dark:text-white pb-3 mb-4"
        >
          <h2
            class="text-xl relative top-3.5 mb-2.5 flex justify-center tracking-wider font-bold dark:text-white"
          >
            {{ isLibrary ? "Библиотека" : "Вишлист" }}
            {{ userName || userId }}
          </h2>

          <IconButton
            icon="✕"
            variant="primary"
            @click="close"
            class="absolute right-4 top-2 text-xl dark:text-white"
          />

          <div class="flex pt-3 justify-between items-center">
            <SearchInput
              v-model="searchQuery"
              placeholder="Название или автор"
              class="mt-3 pl-1"
            />

            <!-- Overlay -->
            <div
              v-if="sortMenuOpen"
              class="fixed inset-0 z-20 block"
              @click="sortMenuOpen = false"
            ></div>
            <div
              v-if="filterMenuOpen"
              class="fixed inset-0 z-20 block"
              @click="filterMenuOpen = false"
            ></div>

            <!-- Кнопки сортировки / фильтра -->
            <div class="relative px-2">
              <span ref="sortButtonRef">
                <IconButton
                  icon="🔽"
                  variant="primary"
                  @click="toggleSortMenu"
                  class="text-xl"
                />
              </span>
              <div
                v-if="sortMenuOpen"
                ref="sortMenuRef"
                class="absolute right-0 mt-3 w-56 bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-30"
              >
                <div class="p-2">
                  <div
                    v-for="category in sortCategories"
                    :key="category.key"
                    class="mb-2"
                  >
                    <div
                      class="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1"
                    >
                      {{ category.label }}
                    </div>
                    <button
                      v-for="opt in category.options"
                      :key="opt.value"
                      @click="setSort(opt.value)"
                      class="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-purple-100 dark:hover:bg-border-dark"
                      :class="{
                        'bg-purple-200 dark:bg-accent/30':
                          currentSort === opt.value,
                      }"
                    >
                      {{ opt.label }}
                    </button>
                  </div>

                  <hr class="my-1 border-border dark:border-border-dark" />

                  <button
                    @click="setSort(null)"
                    class="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-purple-100 dark:hover:bg-border-dark"
                  >
                    Без сортировки
                  </button>
                </div>
              </div>
            </div>

            <div class="relative pr-2" v-if="isLibrary">
              <span ref="filterButtonRef">
                <IconButton
                  :icon="filterIcon"
                  variant="primary"
                  @click="toggleFilterMenu"
                  class="text-xl"
                />
              </span>
              <div
                v-if="filterMenuOpen"
                ref="filterMenuRef"
                class="absolute right-0 mt-3 w-48 bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-30"
              >
                <div class="p-2">
                  <button
                    v-for="opt in filterOptions"
                    :key="opt.value"
                    @click="setFilter(opt.value)"
                    class="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-purple-100 dark:hover:bg-border-dark"
                    :class="{
                      'bg-purple-200 dark:bg-accent/30':
                        currentFilter === opt.value,
                    }"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LoadingSpinner v-if="loading" />
        <div v-else-if="error" class="text-center py-8 text-red-500">
          Ошибка: {{ error }}
        </div>

        <div
          v-else-if="filteredBooks.length === 0"
          class="text-center py-8 text-gray-500"
        >
          Нет книг
        </div>

        <div
          v-else
          class="px-4"
          :class="{
            'grid gap-3 grid-cols-2 min-[700px]:grid-cols-3 min-[900px]:grid-cols-4 min-[1200px]:grid-cols-5 min-[1400px]:grid-cols-6':
              displayMode === 'grid',
            'grid gap-3 grid-cols-1 min-[700px]:grid-cols-2 min-[1000px]:grid-cols-3 min-[1300px]:grid-cols-4':
              displayMode === 'list',
          }"
        >
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="cursor-pointer"
            @click="openBookDetails(book)"
          >
            <ReadonlyBookCard
              :book="book"
              :is-grid="displayMode === 'list'"
              :readonly="true"
              :list-type="listType"
            />
          </div>
        </div>
      </div>
      <ReadonlyBookModal
        :is-open="!!selectedBook"
        :book="selectedBook"
        :list-type="listType"
        @close="closeBookDetails"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useDebounceFn, onClickOutside } from "@vueuse/core";
import { useCommunityStore } from "../../stores/community";
import { useDisplaySettingsStore } from "../../stores/displaySettings";
import IconButton from "../IconButton.vue";
import SearchInput from "../library/SearchInput.vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import ReadonlyBookModal from "./ReadonlyBookModal.vue";
import ReadonlyBookCard from "./ReadonlyBookCard.vue";

const props = defineProps({
  isOpen: Boolean,
  userId: String,
  listType: String, // 'library' или 'wishlist'
  sharedToken: String,
  userName: String,
});
const emit = defineEmits(["close"]);

const displaySettingsStore = useDisplaySettingsStore();
const displayMode = computed(() => displaySettingsStore.displayMode);

const communityStore = useCommunityStore();

const items = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref("");
const debouncedSearch = ref("");
const sortMenuOpen = ref(false);
const filterMenuOpen = ref(false);
const currentSort = ref(null);
const currentFilter = ref("all");
const selectedBook = ref(null);

// Закрытие по клику вне области
const sortMenuRef = ref(null);
const sortButtonRef = ref(null);
const filterMenuRef = ref(null);
const filterButtonRef = ref(null);

const isLibrary = computed(() => props.listType === "library");
const isWishlist = computed(() => props.listType === "wishlist");

// Категории сортировки в зависимости от типа списка
const sortCategories = computed(() => {
  if (props.listType === "library") {
    return [
      {
        key: "title",
        label: "Название",
        options: [
          { value: "title_asc", label: "По возрастанию А–Я" },
          { value: "title_desc", label: "По убыванию Я–А" },
        ],
      },
      {
        key: "author",
        label: "Автор",
        options: [
          { value: "author_asc", label: "По возрастанию А–Я" },
          { value: "author_desc", label: "По убыванию Я–А" },
        ],
      },
    ];
  }

  // Для вишлиста
  return [
    {
      key: "title",
      label: "Название",
      options: [
        { value: "title_asc", label: "По возрастанию А–Я" },
        { value: "title_desc", label: "По убыванию Я–А" },
      ],
    },
    {
      key: "author",
      label: "Автор",
      options: [
        { value: "author_asc", label: "По возрастанию А–Я" },
        { value: "author_desc", label: "По убыванию Я–А" },
      ],
    },
    {
      key: "priority",
      label: "Приоритет",
      options: [
        { value: "priority_desc", label: "Сначала высокий" },
        { value: "priority_asc", label: "Сначала низкий" },
      ],
    },
  ];
});

// Опции фильтра для библиотеки
const filterOptions = [
  { value: "all", label: "📚 Все" },
  { value: "favorite", label: "❤️ Избранные" },
  { value: "finished", label: "✅ Прочитано" },
  { value: "unfinished", label: "📖 Не прочитано" },
  { value: "abandoned", label: "❌ Брошено" },
];

// Иконка для кнопки фильтра
const filterIcon = computed(() => {
  const map = {
    favorite: "❤️",
    finished: "✅",
    unfinished: "📖",
    abandoned: "❌",
  };
  return map[currentFilter.value] || "📚";
});

// Фильтрация
const searched = computed(() => {
  let filtered = [...items.value];
  if (!isLibrary.value) return filtered;
  switch (currentFilter.value) {
    case "favorite":
      filtered = filtered.filter((b) => b.isFavorite);
      break;
    case "finished":
      filtered = filtered.filter((b) => b.status === "прочитано");
      break;
    case "unfinished":
      filtered = filtered.filter((b) => b.status === "не прочитано");
      break;
    case "abandoned":
      filtered = filtered.filter((b) => b.status === "брошено");
      break;
  }
  if (!debouncedSearch.value) return filtered;
  const q = debouncedSearch.value.toLowerCase();
  return filtered.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.author && b.author.toLowerCase().includes(q)),
  );
});

// Сортировка
const filteredBooks = computed(() => {
  const sorted = [...searched.value];
  if (!currentSort.value) return sorted;
  const [field, order] = currentSort.value.split("_");
  sorted.sort((a, b) => {
    let valA = a[field] || "",
      valB = b[field] || "";
    if (field === "rating") {
      valA = a.rating || 0;
      valB = b.rating || 0;
    }
    if (field === "priority") {
      valA = a.priority || 0;
      valB = b.priority || 0;
    }
    if (order === "asc") return valA > valB ? 1 : -1;
    else return valA < valB ? 1 : -1;
  });
  return sorted;
});

const openBookDetails = (book) => {
  selectedBook.value = book;
};
const closeBookDetails = () => {
  selectedBook.value = null;
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = isLibrary.value
      ? await communityStore.fetchUserLibrary(props.userId, props.sharedToken)
      : await communityStore.fetchUserWishlist(props.userId, props.sharedToken);
    items.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const updateDebouncedSearch = useDebounceFn((val) => {
  debouncedSearch.value = val;
}, 300);

watch(searchQuery, (value) => {
  updateDebouncedSearch(value);
});

const toggleSortMenu = () => {
  sortMenuOpen.value = !sortMenuOpen.value;
  filterMenuOpen.value = false;
};

const toggleFilterMenu = () => {
  filterMenuOpen.value = !filterMenuOpen.value;
  sortMenuOpen.value = false;
};

const setSort = (value) => {
  currentSort.value = value;
  sortMenuOpen.value = false;
};

const setFilter = (value) => {
  currentFilter.value = value;
  filterMenuOpen.value = false;
};

const close = () => {
  emit("close");
};

onMounted(() => {
  if (props.isOpen) {
    loadData();
  }
});

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      loadData();
    }
  },
);

watch(
  () => props.userId,
  () => {
    if (props.isOpen) {
      loadData();
    }
  },
);

// Закрытие меню при клике вне
onClickOutside(sortMenuRef, () => (sortMenuOpen.value = false));
onClickOutside(filterMenuRef, () => (filterMenuOpen.value = false));
</script>
