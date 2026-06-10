<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="handleClose"
    >
      <div
        class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
      >
        <ModalHeader
          :title="bookToEdit?.id ? 'Редактировать книгу' : 'Добавить книгу'"
          @close="handleClose"
        />

        <div class="flex-1 overflow-y-auto p-4">
          <div class="flex gap-4 mt-4">
            <CoverUploader
              v-model:coverPreview="coverPreview"
              v-model:coverFile="coverFile"
              v-model:originalImage="originalCover"
              :bookId="bookToEdit?.id"
              @remove="removeCover"
            />

            <div class="flex-1 space-y-4">
              <BookFormFields v-model:title="form.title" />
              <AuthorSelect v-model="form.author" />
              <PublisherSelect v-model="form.publisher" />
            </div>
          </div>

          <WishBinding v-model="form.binding" />

          <!-- Приоритет (5 кнопок) -->
          <div class="mt-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Приоритет</label
            >
            <div class="flex gap-2">
              <button
                v-for="p in 5"
                :key="p"
                type="button"
                @click="form.priority = p"
                class="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                :class="getPriorityButtonClass(p)"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <WishNote v-model="form.note" />
          <BookDescription v-model="form.description" />
        </div>

        <ModalActions
          :is-edit="!!bookToEdit?.id"
          @reset="resetForm"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from "vue";
import ModalHeader from "../modal/ModalHeader.vue";
import ModalActions from "../modal/ModalActions.vue";
import CoverUploader from "../modal/CoverUploader.vue";
import BookFormFields from "../modal/BookForm.vue";
import WishNote from "./WishNote.vue";
import WishBinding from "./WishBinding.vue";
import BookDescription from "../modal/BookDescription.vue";
import PublisherSelect from "../modal/PublisherSelect.vue";
import AuthorSelect from "../modal/AuthorSelect.vue";

const props = defineProps({
  isOpen: Boolean,
  bookToEdit: Object,
});

const emit = defineEmits(["close", "save"]);

// Состояния для обложки
const coverPreview = ref(null);
const coverFile = ref(null);
const originalCover = ref(null);

// Форма
const form = reactive({
  title: "",
  author: "",
  publisher: "",
  binding: "твёрдый",
  priority: 1,
  description: "",
  note: "",
});

// Сброс формы
const resetForm = () => {
  form.title = "";
  form.author = "";
  form.publisher = "";
  form.binding = "твёрдый";
  form.priority = 1;
  form.description = "";
  form.note = "";
  coverPreview.value = null;
  coverFile.value = null;
  originalCover.value = null;
};

// Заполнение при редактировании
watch(
  () => props.bookToEdit,
  (book) => {
    if (book?.id) {
      form.title = book.title || "";
      form.author = book.author || "";
      form.publisher = book.publisher || "";
      form.binding = book.binding || "твёрдый";
      form.priority = book.priority || 1;
      form.description = book.description || "";
      form.note = book.note || "";
      coverPreview.value = book.cover || null;

      if (book.originalCover) {
        originalCover.value = book.originalCover;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// Блокировка скролла
watch(
  () => props.isOpen,
  (open) => {
    if (open) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
  },
);

// Закрытие модалки
const handleClose = () => {
  resetForm();
  emit("close");
};

// Отправка формы
const handleSubmit = () => {
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

const getPriorityButtonClass = (p) => {
  const isActive = form.priority === p;
  const base =
    " text-gray-600 dark:text-gray-100 border border-border dark:border-border-dark";
  const activeClass = "bg-accent/40";
  const inactiveClass = "dark:bg-border-dark/40";
  return `${base} ${isActive ? activeClass : inactiveClass}`;
};

// Удаление обложки
const removeCover = () => {
  coverPreview.value = null;
  coverFile.value = null;
  originalCover.value = null;
};

onUnmounted(() => {
  document.body.classList.remove("modal-open");
});
</script>
