<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl p-6"
      >
        <h2 class="text-xl font-bold mb-4 dark:text-white">
          Добавить пользователя
        </h2>
        <div class="relative">
          <input
            type="text"
            v-model="searchText"
            @input="onSearchInput"
            placeholder="Введите ник или вставьте ссылку"
            class="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-border-dark/40 text-black dark:text-white"
          />
          <div v-if="searching" class="absolute right-2 top-2">⏳</div>
        </div>

        <!-- Результаты поиска -->
        <div
          v-if="searchResults.length > 0"
          class="mt-3 max-h-60 overflow-y-auto space-y-2"
        >
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="flex items-center justify-between p-2 border-b border-border dark:border-border-dark"
          >
            <div class="flex items-center gap-2">
              <img
                :src="user.avatar || defaultAvatar"
                class="w-8 h-8 rounded-full"
              />
              <div>
                <div class="font-medium text-black dark:text-white">
                  {{ user.displayName }}
                </div>
              </div>
            </div>
            <button
              @click="subscribeToUser(user.id)"
              :disabled="loadingUsers.includes(user.id)"
              class="px-3 py-1 rounded text-sm bg-accent hover:bg-accent/80 text-white dark:text-border-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                loadingUsers.includes(user.id) ? "Загрузка..." : "Подписаться"
              }}
            </button>
          </div>
        </div>

        <div
          v-if="
            searchText &&
            !searching &&
            searchResults.length === 0 &&
            !validatingLink &&
            !linkInfo
          "
          class="mt-3 text-gray-500 text-center text-sm"
        >
          Пользователи не найдены
        </div>

        <!-- Валидация вставленной ссылки -->
        <div v-if="validatingLink" class="mt-3 text-center text-sm">
          Проверка ссылки...
        </div>

        <div
          v-if="linkInfo && !searching"
          class="mt-3 p-3 border border-border dark:border-border-dark rounded-lg"
        >
          <p class="font-medium dark:text-white">{{ linkInfo.userName }}</p>
          <div class="mt-2 space-y-1">
            <label
              v-if="linkInfo.libraryAccess"
              class="flex items-center gap-2"
            >
              <CustomCheckbox v-model="subscribeLibrary"
                >Подписаться на библиотеку</CustomCheckbox
              >
            </label>

            <label
              v-if="linkInfo.wishlistAccess"
              class="flex items-center gap-2"
            >
              <CustomCheckbox v-model="subscribeWishlist"
                >Подписаться на вишлист</CustomCheckbox
              >
            </label>
          </div>
          <button
            @click="subscribeToLink"
            class="mt-2 w-full py-1 bg-accent text-white rounded"
            :disabled="!subscribeLibrary && !subscribeWishlist"
          >
            Подписаться
          </button>
        </div>

        <div v-if="addError" class="mt-3 text-red-500 text-sm">
          {{ addError }}
        </div>
        <button
          @click="close"
          class="mt-4 w-full py-2 border border-border dark:border-border-dark rounded-lg text-black dark:text-white"
        >
          Закрыть
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useCommunityStore } from "../../stores/community";
import CustomCheckbox from "../CustomCheckbox.vue";
import { DEFAULT_AVATAR } from "../../constants/constants.js";

const props = defineProps({
  modelValue: Boolean,
  initialToken: String,
});
const emit = defineEmits(["update:modelValue", "added"]);

const communityStore = useCommunityStore();

const searchText = ref("");
const searchResults = ref([]);
const searching = ref(false);
const addError = ref("");
const validatingLink = ref(false);
const linkInfo = ref(null);
const subscribeLibrary = ref(false);
const subscribeWishlist = ref(false);
const loadingUsers = ref([]);

const defaultAvatar = DEFAULT_AVATAR;

// --- Слежение за открытием модалки и начальным токеном ---
watch(
  () => props.modelValue,
  (open) => {
    if (open && props.initialToken) {
      searchText.value = props.initialToken;
      nextTick(() => {
        onSearchInput({ target: { value: props.initialToken } });
      });
    }
  },
  { immediate: true },
);

// Валидация токена пригласительной ссылки
async function validateLinkToken(token) {
  validatingLink.value = true;
  linkInfo.value = null;
  subscribeLibrary.value = false;
  subscribeWishlist.value = false;
  try {
    const result = await communityStore.validateShareToken(token);
    if (result.isValid) {
      linkInfo.value = {
        userId: result.userId,
        userName: result.userName,
        libraryAccess: result.libraryAccess,
        wishlistAccess: result.wishlistAccess,
      };
      // Автоматически отметить чекбоксы для доступных списков
      subscribeLibrary.value = result.libraryAccess;
      subscribeWishlist.value = result.wishlistAccess;
    } else {
      addError.value = "Недействительная ссылка";
    }
  } catch (err) {
    addError.value = "Ошибка проверки ссылки";
  } finally {
    validatingLink.value = false;
  }
}

// Поиск пользователей с дебаунсом 500 мс
const debouncedSearch = useDebounceFn(async (query) => {
  if (!query.trim()) {
    searchResults.value = [];
    searching.value = false;
    return;
  }
  // Проверка, не ссылка ли это
  if (query.includes("community?share=")) {
    const tokenMatch = query.match(/share=([^&]+)/);
    if (tokenMatch) {
      await validateLinkToken(tokenMatch[1]);
    } else {
      searchResults.value = [];
      searching.value = false;
    }
    return;
  }
  // Обычный поиск
  searching.value = true;
  console.log("Searching for:", query);
  try {
    const results = await communityStore.searchUsers(query);
    console.log("Search results:", results);
    searchResults.value = results;
  } catch (err) {
    console.error("Search error:", err);
    addError.value = "Ошибка поиска пользователей";
  } finally {
    searching.value = false;
  }
}, 500);

// Обработчик ввода в поле поиска
function onSearchInput(e) {
  const value = e.target.value;
  searchText.value = value;
  addError.value = "";
  linkInfo.value = null;
  if (value.includes("community?share=")) {
    searchResults.value = [];
    const tokenMatch = value.match(/share=([^&]+)/);
    if (tokenMatch) validateLinkToken(tokenMatch[1]);
    else debouncedSearch(value);
  } else {
    debouncedSearch(value);
  }
}

// Подписка на обычного пользователя (найденного через поиск)
async function subscribeToUser(userId) {
  addError.value = "";

  // Добавляем userId в список загружаемых
  if (!loadingUsers.value.includes(userId)) {
    loadingUsers.value.push(userId);
  }

  try {
    await communityStore.subscribe(userId);
    emit("added");
  } catch (err) {
    addError.value = err.message || "Ошибка подписки";
  } finally {
    // Удаляем userId из списка загружаемых
    loadingUsers.value = loadingUsers.value.filter((id) => id !== userId);
  }
}

// Подписка по пригласительной ссылке (через linkInfo)
async function subscribeToLink() {
  if (!linkInfo.value) return;
  addError.value = "";
  try {
    if (subscribeLibrary.value) {
      await communityStore.subscribe(linkInfo.value.userId, "library");
    }
    if (subscribeWishlist.value) {
      await communityStore.subscribe(linkInfo.value.userId, "wishlist");
    }
    emit("added");
    close();
  } catch (err) {
    addError.value = err.message || "Ошибка подписки";
  }
}

const close = () => {
  emit("update:modelValue", false);
};
</script>
