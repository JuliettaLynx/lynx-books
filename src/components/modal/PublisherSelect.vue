<template>
  <div class="relative w-full">
    <Combobox
      v-model="selectedPublisher"
      :nullable="true"
      @update:modelValue="handleSelect"
    >
      <div class="relative">
        <ComboboxInput
          class="w-full mt-1.5 px-3 py-2 border border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-border-dark/40 dark:text-white"
          :placeholder="placeholder"
          :displayValue="displayValue"
          @change="searchQuery = $event.target.value"
        />
      </div>

      <ComboboxOptions
        class="absolute text-sm z-10 w-full mt-1 bg-white dark:bg-bg-primary-dark dark:text-gray-100 border border-purple-400/50 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <!-- Группа "Начинается с" -->
        <template v-if="startsWithResults.length">
          <div
            class="px-4 py-1 text-xs font-semibold text-black dark:text-white bg-purple-100 dark:bg-border-dark sticky top-0"
          >
            Начинается с "{{ searchQuery }}"
          </div>
          <ComboboxOption
            v-for="publisher in startsWithResults"
            :key="publisher.id"
            :value="publisher"
            v-slot="{ active }"
          >
            <li
              :class="[
                'px-4 py-2 cursor-pointer text-sm transition-colors',
                active
                  ? 'bg-border-dark/50 text-white'
                  : 'hover:bg-purple-400/10 dark:hover:bg-border-dark/50',
              ]"
            >
              {{ publisher.displayName }}
            </li>
          </ComboboxOption>
        </template>

        <!-- Группа "Содержит" -->
        <template v-if="containsResults.length">
          <div
            class="px-4 py-1 text-xs font-semibold text-black dark:text-white bg-purple-100 dark:bg-border-dark sticky top-0"
          >
            Содержит "{{ searchQuery }}"
          </div>
          <ComboboxOption
            v-for="publisher in containsResults"
            :key="publisher.id"
            :value="publisher"
            v-slot="{ active }"
          >
            <li
              :class="[
                'px-4 py-2 text-sm cursor-pointer transition-colors',
                active
                  ? 'bg-border-dark/50 text-white'
                  : 'hover:bg-purple-400/10 dark:hover:bg-border-dark/50',
              ]"
            >
              {{ publisher.displayName }}
            </li>
          </ComboboxOption>
        </template>

        <!-- Сообщение "Будет добавлено" -->
        <div
          v-if="
            searchQuery && !startsWithResults.length && !containsResults.length
          "
          class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center"
        >
          Будет добавлено:
          <span class="font-medium text-blue-500">"{{ searchQuery }}"</span>
        </div>
      </ComboboxOptions>
    </Combobox>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/vue";
import { publishersList } from "../../constants/publishers";

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  placeholder: {
    type: String,
    default: "Издательство",
  },
});

const emit = defineEmits(["update:modelValue"]);

// Состояния
const searchQuery = ref("");
const selectedPublisher = ref(null);

// Фильтрация издательств
const filteredPublishers = computed(() => {
  if (!searchQuery.value) {
    return {
      startsWith: publishersList.map((publisher) => ({
        ...publisher,
        displayName: publisher.name,
      })),
      contains: [],
    };
  }

  const query = searchQuery.value.toLowerCase().trim();
  const startsWithResults = [];
  const containsResults = [];

  publishersList.forEach((publisher) => {
    const nameLower = publisher.name.toLowerCase();
    if (nameLower.startsWith(query)) {
      startsWithResults.push({
        ...publisher,
        displayName: publisher.name,
      });
    } else if (nameLower.includes(query)) {
      containsResults.push({
        ...publisher,
        displayName: publisher.name,
      });
    }
  });

  // Сортировка по алфавиту
  const sortByName = (a, b) => a.name.localeCompare(b.name);
  return {
    startsWith: startsWithResults.sort(sortByName),
    contains: containsResults.sort(sortByName),
  };
});

const startsWithResults = computed(() => filteredPublishers.value.startsWith);
const containsResults = computed(() => filteredPublishers.value.contains);

// Отображаемое значение в поле ввода
const displayValue = (publisher) => {
  if (publisher && typeof publisher === "object") {
    return publisher.displayName;
  }
  return searchQuery.value;
};

// Обработчик выбора элемента из списка
const handleSelect = (publisher) => {
  if (publisher && typeof publisher === "object") {
    // Выбрано существующее издательство
    const publisherName = publisher.name;
    emit("update:modelValue", publisherName);
    searchQuery.value = publisherName;
  } else if (searchQuery.value.trim()) {
    // Пользователь ввёл новое значение (нет в списке)
    const newValue = searchQuery.value.trim();
    emit("update:modelValue", newValue);
  } else {
    emit("update:modelValue", null);
  }
};

// Синхронизация с внешним modelValue (при редактировании книги)
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && typeof newValue === "string") {
      searchQuery.value = newValue;
      // Находим объект издательства для правильного отображения выбранного элемента
      const found = publishersList.find((p) => p.name === newValue);
      if (found) {
        selectedPublisher.value = {
          ...found,
          displayName: found.name,
        };
      } else {
        selectedPublisher.value = null;
      }
    } else {
      searchQuery.value = "";
      selectedPublisher.value = null;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
@media (max-width: 768px) {
  .absolute {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
