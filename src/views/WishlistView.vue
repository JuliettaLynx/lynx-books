<template>
  <div
    class="min-h-screen bg-white dark:bg-bg-primary-dark transition-colors duration-200"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 z-20 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark text-black dark:text-white shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)]"
    >
      <div class="p-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl tracking-wider font-bold">Вишлист</h1>
          <div class="flex gap-1">
            <!-- Сортировка -->
            <div class="relative" ref="sortMenuRef">
              <IconButton
                icon="🔽"
                variant="primary"
                @click="toggleSortMenu"
                class="text-xl"
              />
              <div
                v-if="sortMenuOpen"
                class="absolute right-0 mt-2 w-56 bg-white dark:bg-bg-secondary-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-30"
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

            <UserProfile />
          </div>
        </div>
        <SearchInput
          v-model="searchQuery"
          placeholder="Поиск по названию или автору..."
          class="mt-3"
        />
      </div>
    </div>

    <div class="p-4">
      <LoadingSpinner v-if="wishlistStore.loading" />

      <div v-if="error" class="p-4 text-center">
        <p class="text-red-500">Ошибка: {{ error }}</p>
        <button
          @click="loadData"
          class="mt-2 rounded-lg bg-accent px-4 py-2 text-white"
        >
          Повторить
        </button>
      </div>

      <div v-else>
        <div v-if="filteredBooks.length === 0" class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">Книги не найдены</p>
        </div>

        <div
          v-else
          :class="{
            'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5':
              displayMode === 'grid',
            'grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3':
              displayMode === 'list',
          }"
        >
          <WishlistCard
            v-for="book in filteredBooks"
            :key="book.id"
            :book="book"
            :is-grid="displayMode === 'list'"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @updatePriority="handleUpdatePriority"
          />
        </div>
      </div>
    </div>

    <IconButton
      icon="+"
      variant="primary"
      class="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent hover:bg-accent/60 text-2xl text-white dark:text-black shadow-lg transition-colors duration-200"
      @click="openAddModal"
    />

    <WishlistModal
      :is-open="isModalOpen"
      :book-to-edit="editingBook"
      @close="closeModal"
      @save="saveBook"
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
import IconButton from "../components/IconButton.vue";
import SearchInput from "../components/library/SearchInput.vue";
import UserProfile from "../components/UserProfile.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import WishlistCard from "../components/wishlist/WishlistCard.vue";
import WishlistModal from "../components/wishlist/WishlistModal.vue";
import DeleteModal from "../components/DeleteModal.vue";

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
