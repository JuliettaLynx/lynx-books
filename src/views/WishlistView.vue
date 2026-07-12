<template>
  <div
    class="min-h-screen bg-white dark:bg-bg-primary-dark transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 pl-4 p-1.5 z-20 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark text-black dark:text-white shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)]"
    >
      <div class="flex justify-between items-center">
        <SearchInput v-model="searchQuery" placeholder="Название или автор" />

        <!-- Overlay -->
        <div
          v-if="sortMenuOpen"
          class="fixed inset-0 z-20 block"
          @click="sortMenuOpen = false"
        ></div>

        <!-- Сортировка -->
        <div class="relative px-2" ref="sortMenuRef">
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
            class="absolute right-0 w-56 mt-3 bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-30"
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
      </div>

      <button
        @click="openAddModal"
        class="fixed bottom-20 lg:bottom-5 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-lg bg-accent hover:bg-[#25917b] text-2xl text-white dark:text-bg-primary-dark shadow-lg transition-colors duration-200"
      >
        <PlusIcon class="w-5 h-5" />
      </button>
    </div>

    <div class="p-4">
      <div v-if="error" class="p-4 text-center">
        <p class="text-red-500">Ошибка: {{ error }}</p>
        <button
          @click="loadData"
          class="mt-2 rounded-lg bg-accent px-4 py-2 text-white"
        >
          Повторить
        </button>
      </div>

      <div v-if="!wishlistStore.loading">
        <div v-if="filteredBooks.length === 0" class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">Книги не найдены</p>
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
          <WishlistCard
            v-for="book in filteredBooks"
            :key="book.id"
            :book="book"
            :is-grid="displayMode === 'list'"
            @click="openEditModal(book)"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @updatePriority="handleUpdatePriority"
          />
        </div>
      </div>
    </div>

    <WishlistModal
      :is-open="isModalOpen"
      :book-to-edit="editingBook"
      @close="closeModal"
      @save="saveBook"
      @delete="openDeleteModal"
    />

    <DeleteModal
      :is-open="isDeleteModalOpen"
      title="Удалить книгу из вишлиста?"
      message="Это действие нельзя отменить"
      confirm-text="Удалить"
      cancel-text="Отмена"
      :danger="true"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDebounceFn, onClickOutside } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { auth } from "../firebase/config";
import { useWishlistStore } from "../stores/wishlist";
import { useDisplaySettingsStore } from "../stores/displaySettings";
import SearchInput from "../components/library/SearchInput.vue";
import UserProfile from "../components/UserProfile.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import WishlistCard from "../components/wishlist/WishlistCard.vue";
import WishlistModal from "../components/wishlist/WishlistModal.vue";
import DeleteModal from "../components/DeleteModal.vue";

import SortingIcon from "../assets/icons/sorting.svg?component";
import PlusIcon from "../assets/icons/plus.svg?component";

const wishlistStore = useWishlistStore();

const displaySettings = useDisplaySettingsStore();
const displayMode = computed(() => displaySettings.displayMode);

const { books, loading, error } = storeToRefs(wishlistStore);
const { addBook, updateBook, deleteBook, updatePriority } = wishlistStore;

// UI состояния
const searchQuery = ref("");
const debouncedSearch = ref("");
const sortMenuOpen = ref(false);
const currentSort = ref(null);
const isModalOpen = ref(false);
const editingBook = ref(null);
const isDeleteModalOpen = ref(false);
const deletingBookId = ref(null);

// Реф для onClickOutside
const sortMenuRef = ref(null);

// Закрытие меню при клике вне
onClickOutside(sortMenuRef, () => (sortMenuOpen.value = false));

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
  {
    key: "priority",
    label: "Приоритет",
    options: [
      { value: "priority_asc", label: "По возрастанию (1→5)" },
      { value: "priority_desc", label: "По убыванию (5→1)" },
    ],
  },
];

// Поиск с debounce
const updateDebouncedSearch = useDebounceFn((value) => {
  debouncedSearch.value = value;
}, 300);
watch(searchQuery, (value) => updateDebouncedSearch(value));

// Фильтрация по поиску
const searchedBooks = computed(() => {
  if (!debouncedSearch.value) return books.value;
  const q = debouncedSearch.value.toLowerCase();
  return books.value.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.author && b.author.toLowerCase().includes(q)),
  );
});

// Сортировка
const filteredBooks = computed(() => {
  const sorted = [...searchedBooks.value];
  if (!currentSort.value) return sorted;
  const [field, order] = currentSort.value.split("_");
  sorted.sort((a, b) => {
    let valA = a[field] || "";
    let valB = b[field] || "";
    if (field === "priority") {
      valA = a.priority || 0;
      valB = b.priority || 0;
    }
    if (order === "asc") return valA > valB ? 1 : -1;
    else return valA < valB ? 1 : -1;
  });
  return sorted;
});

// Загрузка данных
const loadData = async () => {
  // В новом API данные загружаются автоматически через initSync
};

onMounted(() => {
  // Инициализируем синхронизацию если пользователь авторизован
  if (auth.currentUser) {
    wishlistStore.initSync(auth.currentUser.uid);
  }
});

// Методы UI
const toggleSortMenu = () => {
  sortMenuOpen.value = !sortMenuOpen.value;
};
const setSort = (value) => {
  currentSort.value = value;
  sortMenuOpen.value = false;
};

const openAddModal = () => {
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
const saveBook = async (bookData) => {
  try {
    if (bookData.id) {
      await updateBook(bookData.id, bookData);
    } else {
      await addBook(bookData);
    }
    // Данные обновятся автоматически через subscription
  } catch (error) {
    console.error("Save book error:", error);
    error.value = error.message || "Ошибка при сохранении книги";
  }
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
      await wishlistStore.deleteBook(deletingBookId.value);
    } catch (error) {
      console.error("Delete book error:", error);
    }
  }
  closeDeleteModal();
  closeModal();
};

const handleUpdatePriority = async (id, priority) => {
  await updatePriority(id, priority);
};

// Закрытие модалки
const handleClose = () => {
  resetForm();
  emit("close");
};

// Валидация формы
const validateForm = () => {
  if (!form.title || !form.title.trim()) {
    alert("Введите название книги");
    return false;
  }
  return true;
};

// Отправка формы
const handleSubmit = () => {
  if (!validateForm()) return;

  const bookData = {
    title: form.title.trim(),
    author: form.author?.trim() || null,
    publisher: form.publisher?.trim() || null,
    cover: coverPreview.value,
    originalCover: originalCover.value,
    binding: form.binding,
    priority: form.priority,
    description: form.description.trim(),
    note: form.note.trim(),
  };
  if (props.bookToEdit?.id) bookData.id = props.bookToEdit.id;
  emit("save", bookData);
  handleClose();
};
</script>
