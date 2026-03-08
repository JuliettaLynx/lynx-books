<template>
  <div class="relative w-full max-w-md">
    <!-- Поле ввода -->
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @focus="isOpen = true"
        @input="isOpen = true"
        @keydown.down.prevent="selectNext"
        @keydown.up.prevent="selectPrevious"
        @keydown.enter.prevent="selectCurrent"
        @keydown.esc="isOpen = false"
        placeholder="Введите издательство"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 dark:text-white"
      />

      <!-- Стрелка вниз -->
      <button
        @click="isOpen = !isOpen"
        class="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Выпадающий список -->
    <div
      v-if="isOpen && filteredPublishers.length > 0"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <ul>
        <li
          v-for="(publisher, index) in filteredPublishers"
          :key="publisher.id"
          @click="selectPublisher(publisher)"
          @mouseenter="highlightedIndex = index"
          :class="[
            'px-4 py-2 cursor-pointer transition-colors',
            highlightedIndex === index
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100',
          ]"
        >
          {{ publisher.name }}
        </li>
      </ul>
    </div>

    <!-- Сообщение, если ничего не найдено -->
    <div
      v-else-if="isOpen && searchQuery && filteredPublishers.length === 0"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-center"
    >
      Ничего не найдено
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "select"]);

// Состояние
const searchQuery = ref("");
const isOpen = ref(false);
const highlightedIndex = ref(-1);

// Статические данные (все издательства)
const publishers = ref([
  { id: 1, name: "Эксмо" },
  { id: 2, name: "АСТ" },
  { id: 3, name: "Просвещение" },
  { id: 4, name: "Дрофа" },
  { id: 5, name: "Вентана-Граф" },
  { id: 6, name: "Русское слово" },
  { id: 7, name: "Бином. Лаборатория знаний" },
  { id: 8, name: "Питер" },
  { id: 9, name: "Манн, Иванов и Фербер" },
  { id: 10, name: "Альпина Паблишер" },
  { id: 11, name: "Росмэн" },
  { id: 12, name: "Махаон" },
  { id: 13, name: "Азбука" },
  { id: 14, name: "Вече" },
  { id: 15, name: "Центрполиграф" },
  { id: 16, name: "Олма Медиа Групп" },
  { id: 17, name: "РИПОЛ классик" },
  { id: 18, name: "Феникс" },
  { id: 19, name: "Проф-Пресс" },
  { id: 20, name: "Самокат" },
]);

// Фильтрация издательств по поисковому запросу
const filteredPublishers = computed(() => {
  if (!searchQuery.value) return publishers.value;

  const query = searchQuery.value.toLowerCase().trim();
  return publishers.value.filter((publisher) =>
    publisher.name.toLowerCase().includes(query),
  );
});

// Методы
const selectPublisher = (publisher) => {
  searchQuery.value = publisher.name;
  isOpen.value = false;
  emit("update:modelValue", publisher);
  emit("select", publisher);
};

// Навигация с клавиатуры
const selectNext = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }

  if (filteredPublishers.value.length > 0) {
    highlightedIndex.value =
      (highlightedIndex.value + 1) % filteredPublishers.value.length;
    // Скролл к выделенному элементу
    scrollToHighlighted();
  }
};

const selectPrevious = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }

  if (filteredPublishers.value.length > 0) {
    highlightedIndex.value =
      highlightedIndex.value <= 0
        ? filteredPublishers.value.length - 1
        : highlightedIndex.value - 1;
    // Скролл к выделенному элементу
    scrollToHighlighted();
  }
};

const selectCurrent = () => {
  if (highlightedIndex.value >= 0 && filteredPublishers.value.length > 0) {
    selectPublisher(filteredPublishers.value[highlightedIndex.value]);
  } else if (filteredPublishers.value.length === 1) {
    // Если остался только один вариант, выбираем его
    selectPublisher(filteredPublishers.value[0]);
  }
};

// Скролл к выделенному элементу
const scrollToHighlighted = () => {
  setTimeout(() => {
    const highlightedElement = document.querySelector(".bg-blue-500");
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, 50);
};

// Закрытие списка при клике вне компонента
const handleClickOutside = (event) => {
  if (!event.target.closest(".relative")) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
