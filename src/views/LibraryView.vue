<template>
  <div
    class="min-h-screen bg-white dark:bg-bg-primary-dark transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 pl-4 p-1.5 z-20 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark text-black dark:text-white shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)] transition-colors duration-200"
    >
      <div class="flex justify-between items-center">
        <!-- Поиск с debounce -->
        <SearchInput v-model="searchQuery" placeholder="Название или автор" />

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

        <!-- Кнопка сортировки -->
        <div class="relative pl-2 pr-1" ref="sortMenuRef">
          <div class="text-border-dark/40 dark:text-border/40">
            <button
              @click="toggleSortMenu"
              class="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-border-dark transition-colors duration-150"
              :class="{
                'text-accent': currentSort,
              }"
            >
              <SortingIcon class="w-6 h-6" />
            </button>
          </div>
          <div
            v-if="sortMenuOpen"
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
                  v-for="option in category.options"
                  :key="option.value"
                  @click="setSort(option.value)"
                  class="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-purple-100 dark:hover:bg-border-dark"
                  :class="{
                    'bg-purple-200 dark:bg-accent/30':
                      currentSort === option.value,
                  }"
                >
                  {{ option.label }}
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

        <!-- Кнопка фильтра -->
        <div class="relative pr-2" ref="filterMenuRef">
          <div class="text-border-dark/40 dark:text-border/40">
            <button
              @click="toggleFilterMenu"
              class="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-border-dark transition-colors duration-150"
              :class="{
                'text-accent': currentFilter !== 'all',
              }"
            >
              <FilterIcon class="w-6 h-6" />
            </button>
          </div>
          <div
            v-if="filterMenuOpen"
            class="absolute right-0 mt-3 w-48 bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-30"
          >
            <div class="p-2">
              <button
                v-for="option in filterOptions"
                :key="option.value"
                @click="setFilter(option.value)"
                class="w-full flex gap-2 text-left pl-2 p-1.5 text-sm rounded hover:bg-purple-100 dark:hover:bg-border-dark"
                :class="{
                  'bg-purple-200 dark:bg-accent/30':
                    currentFilter === option.value,
                }"
              >
                <component :is="option.icon" class="w-5 h-5 text-red-600" />
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="openModal"
        class="fixed bottom-20 lg:bottom-5 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-lg bg-accent hover:bg-[#25917b] text-2xl text-white dark:text-bg-primary-dark shadow-lg transition-colors duration-200"
      >
        <PlusIcon class="w-5 h-5" />
      </button>
    </div>

    <div v-if="libraryStore.error" class="p-4 text-center">
      <p class="text-red-500 dark:text-red-400">
        Ошибка: {{ libraryStore.error }}
      </p>
      <button
        @click="libraryStore.initSync(auth.currentUser?.uid)"
        class="mt-2 rounded-lg bg-accent px-4 py-2 text-white"
      >
        Повторить
      </button>
    </div>

    <!-- Список книг -->
    <div v-if="!libraryStore.loading" class="p-4">
      <div v-if="filteredBooks.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">Книги не найдены</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {{
            libraryStore.books.length === 0
              ? "Добавьте первую книгу"
              : "Попробуйте изменить параметры поиска"
          }}
        </p>
      </div>

      <div
        v-else
        :class="{
          'grid gap-3 grid-cols-2 min-[700px]:grid-cols-3 min-[900px]:grid-cols-4 min-[1200px]:grid-cols-5 min-[1400px]:grid-cols-6 min-[1600px]:grid-cols-7 min-[1800px]:grid-cols-8 min-[2000px]:grid-cols-9 min-[2200px]:grid-cols-10 min-[2400px]:grid-cols-11 min-[2600px]:grid-cols-12 min-[2800px]:grid-cols-13 min-[3000px]:grid-cols-14':
            displayMode === 'grid',
          'grid gap-3 grid-cols-1 min-[700px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1300px]:grid-cols-4 min-[1600px]:grid-cols-5 min-[1900px]:grid-cols-6 min-[2100px]:grid-cols-7 min-[2400px]:grid-cols-8':
            displayMode === 'list',
        }"
      >
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          :is-grid="displayMode === 'list'"
          @click="openEditModal(book)"
          @edit="openEditModal"
          @favorite="handleToggleFavorite"
          @delete="openDeleteModal"
        />
      </div>

      <!-- Модальное окно -->
      <BookModal
        :is-open="isModalOpen"
        :book-to-edit="editingBook"
        @close="closeModal"
        @save="saveBook"
        @delete="openDeleteModal"
      />

      <DeleteModal
        :is-open="isDeleteModalOpen"
        title="Удалить книгу?"
        message="Это действие нельзя отменить"
        confirm-text="Удалить"
        cancel-text="Отмена"
        :danger="true"
        @close="closeDeleteModal"
        @confirm="confirmDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { auth } from "../firebase/config";
import { useDebounceFn, onClickOutside } from "@vueuse/core";
import { useLibraryStore } from "../stores/library";
import { useDisplaySettingsStore } from "../stores/displaySettings";
import IconButton from "../components/IconButton.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import SearchInput from "../components/library/SearchInput.vue";
import BookCard from "../components/library/BookCard.vue";
import BookModal from "../components/library/BookModal.vue";
import DeleteModal from "../components/DeleteModal.vue";

import FilterIcon from "../assets/icons/filter.svg?component";
import SortingIcon from "../assets/icons/sorting.svg?component";
import PlusIcon from "../assets/icons/plus.svg?component";

import AllBooksIcon from "../assets/icons/allbooks.svg?component";
import FavoriteIcon from "../assets/icons/favorite.svg?component";
import FinishedIcon from "../assets/icons/finished.svg?component";
import UnfinishedIcon from "../assets/icons/unfinished.svg?component";
import AbandonedIcon from "../assets/icons/abandoned.svg?component";

const libraryStore = useLibraryStore();
const displaySettings = useDisplaySettingsStore();
const displayMode = computed(() => displaySettings.displayMode);

// Состояние UI
const searchQuery = ref("");
const debouncedSearch = ref("");
const sortMenuOpen = ref(false);
const filterMenuOpen = ref(false);
const currentSort = ref(null);
const currentFilter = ref("all");
const isModalOpen = ref(false);
const editingBook = ref(null);
const isDeleteModalOpen = ref(false);
const deletingBookId = ref(null);

// Рефы для onClickOutside
const sortMenuRef = ref(null);
const filterMenuRef = ref(null);

// Закрытие меню при клике вне
onClickOutside(sortMenuRef, () => (sortMenuOpen.value = false));
onClickOutside(filterMenuRef, () => (filterMenuOpen.value = false));

// Категории сортировки
const sortCategories = [
  {
    key: "title",
    label: "Название",
    options: [
      { value: "title_asc", label: "По возрастанию (А–Я)" },
      { value: "title_desc", label: "По убыванию (Я–А)" },
    ],
  },
  {
    key: "author",
    label: "Автор",
    options: [
      { value: "author_asc", label: "По возрастанию (А–Я)" },
      { value: "author_desc", label: "По убыванию (Я–А)" },
    ],
  },
];

onMounted(() => {
  // Если пользователь вошел, а данные ещё не синхронизированы
  if (auth.currentUser) {
    libraryStore.initSync(auth.currentUser.uid);
  }
});

// Опции фильтра
const filterOptions = [
  { value: "all", label: "Все", icon: AllBooksIcon },
  { value: "favorite", label: "Избранные", icon: FavoriteIcon },
  { value: "finished", label: "Прочитано", icon: FinishedIcon },
  { value: "unfinished", label: "Не прочитано", icon: UnfinishedIcon },
  { value: "abandoned", label: "Брошено", icon: AbandonedIcon },
];

// Методы управления модалкой
const openModal = () => {
  editingBook.value = null;
  isModalOpen.value = true;
};

const openEditModal = (book) => {
  editingBook.value = { ...book };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingBook.value = null;
};

// Методы управления сортировкой и фильтрами
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

// Debounce для поиска
const updateDebouncedSearch = useDebounceFn((value) => {
  debouncedSearch.value = value;
}, 300);

watch(searchQuery, (value) => {
  updateDebouncedSearch(value);
});

// Применение фильтра
const filteredByStatus = computed(() => {
  let filtered = [...libraryStore.books];

  switch (currentFilter.value) {
    case "favorite":
      filtered = filtered.filter((book) => book.isFavorite);
      break;
    case "finished":
      filtered = filtered.filter((book) => book.status === "прочитано");
      break;
    case "unfinished":
      filtered = filtered.filter((book) => book.status === "не прочитано");
      break;
    case "abandoned":
      filtered = filtered.filter((book) => book.status === "брошено");
      break;
    case "all":
    default:
      break;
  }

  return filtered;
});

// Поиск по названию и автору
const searched = computed(() => {
  if (!debouncedSearch.value) return filteredByStatus.value;

  const query = debouncedSearch.value.toLowerCase();
  return filteredByStatus.value.filter(
    (book) =>
      (book.title?.toLowerCase() ?? "").includes(query) ||
      (book.author?.toLowerCase() ?? "").includes(query),
  );
});

// Применение сортировки
const filteredBooks = computed(() => {
  const sorted = [...searched.value];

  if (currentSort.value) {
    const [field, order] = currentSort.value.split("_");
    sorted.sort((a, b) => {
      let valA = a[field] || "";
      let valB = b[field] || "";
      if (order === "asc") return valA > valB ? 1 : -1;
      else return valA < valB ? 1 : -1;
    });
  }

  return sorted;
});

// Обработчики действий с книгами
const handleToggleFavorite = async (book) => {
  await libraryStore.toggleFavorite(book);
};

const openDeleteModal = (book) => {
  deletingBookId.value = book.id;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  deletingBookId.value = null;
};

const confirmDelete = async () => {
  if (deletingBookId.value) {
    try {
      await libraryStore.deleteBook(deletingBookId.value);
    } catch (error) {
      console.error("Delete book error:", error);
    }
  }
  closeDeleteModal();
  closeModal();
};

// Сохранение книги
const saveBook = async (bookData) => {
  if (bookData.id) {
    // Редактирование
    await libraryStore.updateBook(bookData.id, bookData);
  } else {
    // Добавление
    await libraryStore.addBook(bookData);
  }
};
</script>
