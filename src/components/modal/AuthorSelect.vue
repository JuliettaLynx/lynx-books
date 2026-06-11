<template>
  <div class="relative w-full">
    <Combobox
      v-model="selectedAuthor"
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
            v-for="author in startsWithResults"
            :key="author.id"
            :value="author"
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
              {{ author.displayName }}
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
            v-for="author in containsResults"
            :key="author.id"
            :value="author"
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
              {{ author.displayName }}
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
import { authorsList } from "../../constants/authors";

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  placeholder: {
    type: String,
    default: "Автор",
  },
});

const emit = defineEmits(["update:modelValue"]);

// Состояния
const searchQuery = ref("");
const selectedAuthor = ref(null);

// Генерация вариантов имени (оригинальная логика)
const generateNameVariants = (fullName) => {
  const parts = fullName.split(" ");
  if (parts.length === 2) {
    return [
      { text: fullName, type: "original" }, // "Фамилия Имя"
      { text: `${parts[1]} ${parts[0]}`, type: "reversed" }, // "Имя Фамилия"
    ];
  }
  return [{ text: fullName, type: "original" }];
};

// Фильтрация авторов (полностью ваша логика)
const filteredAuthors = computed(() => {
  if (!searchQuery.value) {
    return {
      startsWith: authorsList.map((author) => ({
        ...author,
        displayName: author.name,
        originalName: author.name,
      })),
      contains: [],
    };
  }

  const query = searchQuery.value.toLowerCase().trim();
  const startsWithResults = [];
  const containsResults = [];

  authorsList.forEach((author) => {
    const variants = generateNameVariants(author.name);
    let bestMatch = null;
    let bestMatchType = null;
    let bestMatchVariant = null;
    let bestMatchIndex = Infinity;

    variants.forEach((variant) => {
      const variantLower = variant.text.toLowerCase();

      if (variantLower.startsWith(query)) {
        if (!bestMatch || bestMatchType !== "starts") {
          bestMatch = author;
          bestMatchType = "starts";
          bestMatchVariant = variant;
        }
      } else if (variantLower.includes(query)) {
        const matchIndex = variantLower.indexOf(query);
        if (
          !bestMatch ||
          (bestMatchType === "contains" && matchIndex < bestMatchIndex)
        ) {
          bestMatch = author;
          bestMatchType = "contains";
          bestMatchVariant = variant;
          bestMatchIndex = matchIndex;
        }
      }
    });

    if (bestMatch) {
      const resultItem = {
        ...bestMatch,
        displayName: bestMatchVariant.text,
        originalName: bestMatch.name,
      };

      if (bestMatchType === "starts") {
        startsWithResults.push(resultItem);
      } else {
        containsResults.push(resultItem);
      }
    }
  });

  const sortByName = (a, b) => a.displayName.localeCompare(b.displayName);
  return {
    startsWith: startsWithResults.sort(sortByName),
    contains: containsResults.sort(sortByName),
  };
});

const startsWithResults = computed(() => filteredAuthors.value.startsWith);
const containsResults = computed(() => filteredAuthors.value.contains);

// Отображаемое значение в поле ввода
const displayValue = (author) => {
  if (author && typeof author === "object") {
    return author.displayName;
  }
  return searchQuery.value;
};

// Обработчик выбора элемента из списка
const handleSelect = (author) => {
  if (author && typeof author === "object") {
    // Выбран существующий автор
    const authorName = author.originalName;
    emit("update:modelValue", authorName);
    searchQuery.value = authorName;
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
      // Находим объект автора для правильного отображения выбранного элемента
      const found = authorsList.find((a) => a.name === newValue);
      if (found) {
        selectedAuthor.value = {
          ...found,
          displayName: found.name,
          originalName: found.name,
        };
      } else {
        selectedAuthor.value = null;
      }
    } else {
      searchQuery.value = "";
      selectedAuthor.value = null;
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
