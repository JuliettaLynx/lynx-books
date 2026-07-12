<template>
  <div class="relative" ref="menuContainer">
    <!-- Иконка профиля -->
    <button
      @click.stop="toggleMenu"
      class="w-10 h-10 z-50 rounded-full bg-green-300 flex items-center justify-center text-black font-bold text-lg transition-all overflow-hidden"
      :class="{ 'ring-2 ring-accent': isOpen }"
    >
      <img
        v-if="userAvatar"
        :src="userAvatar"
        alt="avatar"
        class="w-full h-full object-cover"
      />
      <span v-else>
        {{ user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?" }}
      </span>
    </button>

    <!-- Выпадающее меню -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed pb-14 inset-0 z-30 overflow-auto"
    ></div>
    <div
      v-if="isOpen"
      class="absolute z-50 right-0 top-12 w-72 bg-white dark:bg-bg-secondary-dark rounded-2xl shadow-xl border border-border dark:border-border-dark text-black dark:text-white overflow-hidden"
    >
      <!-- Шапка профиля -->
      <div
        class="p-4 bg-purple-100 dark:bg-border-dark border-b border-border dark:border-border-dark"
      >
        <button
          @click.stop="openSection('profile')"
          class="rounded-lg w-72 flex transition-colors"
        >
          <div
            class="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold overflow-hidden"
          >
            <img
              v-if="userAvatar"
              :src="userAvatar"
              alt="avatar"
              class="w-full h-full object-cover"
            />
            <span v-else>
              {{
                user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"
              }}
            </span>
          </div>

          <div class="flex-1 min-w-0 relative text-left left-3">
            <p class="font-bold flex">
              {{ user?.displayName || "Пользователь" }}
              <span><PenIcon class="w-6 h-6 scale-75" /></span>
            </p>
            <p class="text-sm truncate">{{ user?.email }}</p>
          </div>
        </button>
      </div>

      <!-- Статистика -->
      <div class="p-4 border-b border-border dark:border-border-dark">
        <div class="flex justify-between items-center">
          <span class="">Цель на день:</span>

          <button
            @click.stop="openSection('goal')"
            class="rounded-lg flex items-center gap-3 transition-colors"
          >
            <span
              class="font-bold relative right-1 text-accent dark:text-accent"
              >{{ dailyGoal || 0 }} стр.</span
            >
          </button>
        </div>
      </div>

      <!-- Настройки темы
      <div class="p-2">
        <div class="px-2 py-1 grid grid-cols-6 gap-4">
          <p class="col-span-3">Тема:</p>
          <button
            @click.stop="setTheme('light')"
            class="flex flex-col items-center justify-center rounded-lg transition-colors"
            :class="
              colorMode === 'light'
                ? 'bg-accent/10 ring-2 ring-accent/50'
                : 'hover:bg-border/50 dark:hover:bg-border-dark/40'
            "
          >
            <span class="text-base mb-1">☀️</span>
          </button>

          <button
            @click.stop="setTheme('dark')"
            class="flex flex-col items-center justify-center rounded-lg transition-colors"
            :class="
              colorMode === 'dark'
                ? 'bg-accent/10 ring-2 ring-accent/50'
                : 'hover:bg-border/50 dark:hover:bg-border-dark/40'
            "
          >
            <span class="text-base mb-1">🌙</span>
          </button>

          <button
            @click.stop="setTheme('auto')"
            class="flex flex-col items-center justify-center rounded-lg transition-colors"
            :class="
              colorMode === 'auto'
                ? 'bg-accent/10 ring-2 ring-accent/50'
                : 'hover:bg-border/50 dark:hover:bg-border-dark/40'
            "
          >
            <span class="text-base mb-1">⚙️</span>
          </button>
        </div>
      </div>
      -->

      <!-- Настройки режима отображения -->
      <div class="p-2 border-b border-border dark:border-border-dark">
        <div class="px-2 py-1 grid grid-cols-6 gap-4">
          <p class="col-span-4">Отображение книг:</p>
          <button
            @click.stop="setDisplayMode('grid')"
            class="flex gap-3 justify-center items-center rounded-lg transition-colors"
            :class="
              displayMode === 'grid'
                ? 'bg-accent/10 ring-2 ring-accent/50'
                : 'hover:bg-border/50 dark:hover:bg-border-dark/40'
            "
          >
            <span class="text-lg">⊞</span>
          </button>

          <button
            @click.stop="setDisplayMode('list')"
            class="flex gap-3 justify-center items-center rounded-lg transition-colors"
            :class="
              displayMode === 'list'
                ? 'bg-accent/10 ring-2 ring-accent/50'
                : 'hover:bg-border/50 dark:hover:bg-border-dark/40'
            "
          >
            <span class="text-lg">☰</span>
          </button>
        </div>
      </div>

      <!-- Меню информации -->
      <div class="p-2 border-b border-border dark:border-border-dark">
        <button
          @click.stop="openAboutModal"
          class="w-full px-2 py-1 text-left hover:bg-border/50 dark:hover:bg-border-dark/40 rounded-lg flex items-center gap-3 transition-colors"
        >
          <span class="flex-1 text-base">О нас</span>
        </button>
      </div>

      <!-- Меню действий -->
      <div class="p-2">
        <button
          @click.stop="openSection('password')"
          class="w-full px-2 py-1 text-left hover:bg-border/50 dark:hover:bg-border-dark/40 rounded-lg flex items-center gap-3 transition-colors"
        >
          <span class="flex-1 text-base">Сменить пароль</span>
        </button>

        <button
          @click.stop="openLogoutConfirm"
          class="w-full px-2 py-1 text-left hover:bg-border/50 dark:hover:bg-border-dark/40 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
        >
          <span class="flex-1 text-base">Выйти</span>
        </button>

        <button
          @click.stop="openDeleteAccountConfirm"
          class="w-full px-2 py-1 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
        >
          <span class="flex-1 text-base">Удалить аккаунт</span>
        </button>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <Teleport to="body">
      <div
        v-if="activeSection"
        class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
        @click.self="closeSection"
        @click.stop
      >
        <div
          class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
          @click.stop
        >
          <!-- Заголовок модалки -->
          <div
            class="p-4 border-b border-border dark:border-border-dark flex justify-between items-center"
          >
            <h2 class="text-xl font-bold dark:text-white">{{ modalTitle }}</h2>
            <button
              @click="closeSection"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span class="text-2xl">✕</span>
            </button>
          </div>

          <!-- Контент модалки -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Редактирование профиля -->
            <div v-if="activeSection === 'profile'" class="space-y-4">
              <div class="flex justify-center">
                <AvatarUploader
                  :avatar-preview="avatarPreview"
                  :avatar-file="avatarFile"
                  :original-image="originalAvatar"
                  :user-id="user?.uid"
                  :display-name="editDisplayName"
                  :email="user?.email"
                  @update:avatar-preview="handleAvatarPreviewUpdate"
                  @update:avatar-file="avatarFile = $event"
                  @update:original-image="originalAvatar = $event"
                  @remove="handleAvatarRemove"
                />
              </div>

              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Имя</label
                >
                <input
                  v-model="editDisplayName"
                  type="text"
                  class="w-full px-4 py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg focus:ring-2 focus:ring-accent dark:text-white"
                />
              </div>
            </div>

            <!-- Изменение цели -->
            <div v-if="activeSection === 'goal'" class="space-y-4">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Дневная цель (страниц)
                </label>
                <input
                  v-model.number="editDailyGoal"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg focus:ring-2 focus:ring-accent dark:text-white"
                />
              </div>
            </div>

            <!-- Смена пароля -->
            <div v-if="activeSection === 'password'" class="space-y-4">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Текущий пароль</label
                >
                <input
                  v-model="passwordData.current"
                  type="password"
                  autocomplete="off"
                  readonly
                  onfocus="this.removeAttribute('readonly')"
                  class="w-full px-4 py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg dark:text-white"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Новый пароль</label
                >
                <input
                  v-model="passwordData.new"
                  type="password"
                  class="w-full px-4 py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg dark:text-white"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Подтверждение</label
                >
                <input
                  v-model="passwordData.confirm"
                  type="password"
                  class="w-full px-4 py-2 dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg dark:text-white"
                />
              </div>
            </div>

            <!-- Сообщение об ошибке/успехе -->
            <div
              v-if="sectionError"
              class="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm"
            >
              {{ sectionError }}
            </div>
            <div
              v-if="sectionSuccess"
              class="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm"
            >
              {{ sectionSuccess }}
            </div>
          </div>

          <!-- Кнопки действий -->
          <div
            class="p-4 border-t border-border dark:border-border-dark flex gap-2"
          >
            <button
              @click="closeSection"
              class="flex-1 px-4 py-2 dark:bg-border-dark/40 text-black dark:text-white rounded-lg border border-border dark:border-border-dark hover:bg-border-dark/20 dark:hover:bg-border-dark transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveSection"
              :disabled="sectionLoading"
              class="flex-1 px-4 py-2 bg-accent/60 hover:bg-accent/80 text-black dark:text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              <span v-if="!sectionLoading">Сохранить</span>
              <span v-else class="flex items-center justify-center">
                <img
                  src="/public/loading.png"
                  alt="Loading..."
                  class="w-7 h-7 animate-spin"
                />
                Сохранение...
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модальное окно "О нас" -->
    <Teleport to="body">
      <div
        v-if="showAboutModal"
        class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
        @click="showAboutModal = false"
        @click.stop
      >
        <div
          class="bg-white dark:bg-bg-secondary-dark w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col shadow-2xl"
          @click.stop
        >
          <!-- Заголовок -->
          <div
            class="p-4 border-b border-border dark:border-border-dark flex justify-between items-center"
          >
            <h2 class="text-xl font-bold dark:text-white">О нас</h2>
            <button
              @click="showAboutModal = false"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span class="text-2xl">✕</span>
            </button>
          </div>

          <!-- Контент -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Описание -->
            <div>
              <p
                class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                <b>Lynx Books</b> — это современный цифровой помощник для
                читателей, в котором можно:<br />
                <span class="flex gap-1"
                  ><LibraryIcon class="w-6 h-6 scale-75" />Вести личную
                  библиотеку и список желаний
                </span>
                <span class="flex gap-1"
                  ><TrackerIcon class="w-6 h-6 scale-75" />Отслеживать прогресс
                  чтения<br
                /></span>
                <span class="flex gap-1"
                  ><CommunityIcon class="w-6 h-6 scale-75" />Выбирать книги для
                  подарки</span
                >
              </p>
            </div>

            <!-- Контакты -->
            <div>
              <h3 class="font-semibold text-lg mb-3 dark:text-white">
                Контакты
              </h3>
              <div class="flex gap-1">
                <TelegramIcon class="w-6 h-6 scale-75 text-accent" />
                <a
                  href="https://t.me/julietta_lynx"
                  target="_blank"
                  class="text-sm mt-0.5 text-accent hover:underline"
                >
                  Telegram: @julietta_lynx
                </a>
              </div>
            </div>

            <!-- Обратная связь -->
            <div>
              <h3 class="font-semibold text-lg mb-2 dark:text-white">
                Обратная связь
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Есть идея, предложение или нашли баг? Мы будем рады вашему
                отзыву!
              </p>
              <a
                href="https://forms.gle/fG1TnnEi2oPm1fd66"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-1 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors text-sm font-medium"
              >
                <span> <ReviewIcon class="w-6 h-6 scale-75" /></span> Оставить
                отзыв
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модальные окна подтверждения -->
    <DeleteModal
      :is-open="isLogoutConfirmOpen"
      title="Выйти из аккаунта?"
      message="Вы будете перенаправлены на страницу авторизации"
      confirm-text="Выйти"
      cancel-text="Отмена"
      :danger="false"
      @close="closeLogoutConfirm"
      @confirm="handleLogout"
    />
    <DeleteModal
      :is-open="isDeleteAccountConfirmOpen"
      title="Удалить аккаунт?"
      message="Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены."
      confirm-text="Удалить"
      cancel-text="Отмена"
      :danger="true"
      @close="closeDeleteAccountConfirm"
      @confirm="deleteAccount"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";
import { useDisplaySettingsStore } from "../stores/displaySettings";
import { auth } from "../firebase/config";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  signOut,
} from "firebase/auth";
import { useUserStore } from "../stores/user";
import { usersDB } from "../db/index";
import AvatarUploader from "./AvatarUploader.vue";
import DeleteModal from "./DeleteModal.vue";

import PenIcon from "../assets/icons/pen.svg?component";
import LibraryIcon from "../assets/icons/navigation/library.svg?component";
import TrackerIcon from "../assets/icons/navigation/tracker.svg?component";
import CommunityIcon from "../assets/icons/navigation/community.svg?component";
import TelegramIcon from "../assets/icons/feedback/telegram.svg?component";
import ReviewIcon from "../assets/icons/feedback/review.svg?component";

const router = useRouter();
const userStore = useUserStore();
const displaySettings = useDisplaySettingsStore();
const user = computed(() => auth.currentUser);

// Тема
const colorMode = useColorMode({
  emitAuto: true,
  modes: {
    light: "dark",
    dark: "dark",
    auto: "dark",
  },
});

// Режим отображения
const displayMode = computed(() => displaySettings.displayMode);

// Состояние меню
const isOpen = ref(false);
const activeSection = ref(null);
const menuContainer = ref(null);

// Данные для редактирования
const editDisplayName = ref("");
const avatarPreview = ref(null);
const avatarFile = ref(null);
const originalAvatar = ref(null);
const editDailyGoal = ref(50);

const isLogoutConfirmOpen = ref(false);
const isDeleteAccountConfirmOpen = ref(false);
const showAboutModal = ref(false);

const passwordData = ref({
  current: "",
  new: "",
  confirm: "",
});

// Состояния загрузки
const sectionLoading = ref(false);
const sectionError = ref("");
const sectionSuccess = ref("");

// Цель
const dailyGoal = ref(50);

// Аватар пользователя
const userAvatar = ref(null);
const hasAvatarChanged = ref(false);

// Заголовок модалки
const modalTitle = computed(() => {
  switch (activeSection.value) {
    case "profile":
      return "Редактировать профиль";
    case "goal":
      return "Изменить цель";
    case "password":
      return "Сменить пароль";
    default:
      return "";
  }
});

// Методы для режима отображения
const setDisplayMode = (mode) => {
  displaySettings.setDisplayMode(mode);
};

// Методы для модального окна подтверждения выхода
const openLogoutConfirm = () => {
  isLogoutConfirmOpen.value = true;
};

const closeLogoutConfirm = () => {
  isLogoutConfirmOpen.value = false;
};

// Методы для модального окна подтверждения удаления аккаунта
const openDeleteAccountConfirm = () => {
  isDeleteAccountConfirmOpen.value = true;
};

const closeDeleteAccountConfirm = () => {
  isDeleteAccountConfirmOpen.value = false;
};

// Методы для модального окна "О нас"
const openAboutModal = () => {
  showAboutModal.value = true;
};

// Обработчики AvatarUploader
const handleAvatarPreviewUpdate = (newPreview) => {
  avatarPreview.value = newPreview;
  hasAvatarChanged.value = true;
};

const handleAvatarRemove = () => {
  avatarPreview.value = null;
  avatarFile.value = null;
  originalAvatar.value = null;
  userAvatar.value = null;
  hasAvatarChanged.value = true;
};

// Обновляем загрузку пользовательских данных
const loadUserData = async () => {
  if (!user.value?.uid) return;

  try {
    // Загружаем из userStore или IndexedDB
    let userData = userStore.userData;

    if (!userData) {
      userData = await usersDB.get(user.value.uid);
    }

    if (userData) {
      // Аватар
      if (userData.avatar) {
        userAvatar.value = userData.avatar;
        avatarPreview.value = userData.avatar;
      }

      // Оригинальный аватар (для редактирования)
      if (userData.originalAvatar) {
        originalAvatar.value = userData.originalAvatar;
      }

      // Цель
      if (userData.dailyGoal) {
        dailyGoal.value = userData.dailyGoal;
        editDailyGoal.value = userData.dailyGoal;
      }

      // Имя
      if (userData.displayName) {
        editDisplayName.value = userData.displayName;
      } else if (user.value?.displayName) {
        editDisplayName.value = user.value.displayName;
      }
    } else {
      // Если нет данных, берем из Firebase Auth
      if (user.value?.displayName) {
        editDisplayName.value = user.value.displayName;
      }
      if (user.value?.photoURL) {
        userAvatar.value = user.value.photoURL;
        avatarPreview.value = user.value.photoURL;
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки пользователя:", error);
  }
};

// Сохранение данных пользователя в IndexedDB
const saveUserToDB = async (updates) => {
  if (!user.value?.uid) return;

  try {
    const existing = await usersDB.get(user.value.uid);
    if (existing) {
      await usersDB.update(user.value.uid, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await usersDB.add({
        userId: user.value.uid,
        email: user.value.email,
        ...updates,
        createdAt: new Date().toISOString(),
      });
    }
    console.log("Пользователь сохранен в IndexedDB");
  } catch (error) {
    console.error("Ошибка сохранения пользователя в IndexedDB:", error);
    throw error;
  }
};

// Обработчик клика вне меню
const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// Методы для темы
const setTheme = (theme) => {
  colorMode.value = theme;
};

// Методы меню
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const openSection = (section) => {
  activeSection.value = section;
  hasAvatarChanged.value = false;

  if (section === "profile") {
    editDisplayName.value = user.value?.displayName || "";
    // Загружаем текущий аватар для отображения в редакторе
    if (userAvatar.value) {
      avatarPreview.value = userAvatar.value;
    }
    originalAvatar.value = null;
    avatarFile.value = null;
  } else if (section === "goal") {
    editDailyGoal.value = dailyGoal.value;
  } else if (section === "password") {
    passwordData.value = { current: "", new: "", confirm: "" };
  }

  sectionError.value = "";
  sectionSuccess.value = "";
};

const closeSection = () => {
  activeSection.value = null;
  hasAvatarChanged.value = false;
};

const saveSection = async () => {
  sectionLoading.value = true;
  sectionError.value = "";
  sectionSuccess.value = "";

  try {
    switch (activeSection.value) {
      case "profile": {
        const updates = {};
        const nameChanged = editDisplayName.value !== user.value?.displayName;

        if (nameChanged) {
          updates.displayName = editDisplayName.value;
          await userStore.updateProfile(updates);
        }

        // Если аватар был изменен
        if (hasAvatarChanged.value) {
          if (avatarPreview.value) {
            await userStore.updateAvatar(
              avatarPreview.value,
              originalAvatar.value,
            );
            userAvatar.value = avatarPreview.value;
          } else {
            await userStore.updateAvatar(null, null);
            userAvatar.value = null;
          }
          hasAvatarChanged.value = false;
        }

        sectionSuccess.value = "Профиль обновлён";
        break;
      }

      case "goal":
        dailyGoal.value = editDailyGoal.value;
        localStorage.setItem("dailyGoal", editDailyGoal.value);
        userStore.setDailyGoal(editDailyGoal.value);
        await saveUserToDB({ dailyGoal: editDailyGoal.value });
        sectionSuccess.value = "Цель обновлена";
        break;

      case "password":
        if (passwordData.value.new !== passwordData.value.confirm) {
          throw new Error("Пароли не совпадают");
        }
        if (passwordData.value.new.length < 6) {
          throw new Error("Пароль должен быть минимум 6 символов");
        }

        const credential = EmailAuthProvider.credential(
          user.value.email,
          passwordData.value.current,
        );
        await reauthenticateWithCredential(user.value, credential);
        await updatePassword(user.value, passwordData.value.new);
        sectionSuccess.value = "Пароль успешно изменён";
        passwordData.value = { current: "", new: "", confirm: "" };
        break;
    }
  } catch (error) {
    console.error("Save error:", error);
    sectionError.value = error.message || "Произошла ошибка";
  } finally {
    sectionLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push("/auth");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    closeLogoutConfirm();
  }
};

const confirmDelete = () => {
  if (
    confirm(
      "Вы уверены? Это действие нельзя отменить. Все ваши данные будут удалены.",
    )
  ) {
    deleteAccount();
  }
};

const deleteAccount = async () => {
  try {
    // Удаляем данные пользователя из IndexedDB
    if (user.value?.uid) {
      await usersDB.delete(user.value.uid);
    }
    await deleteUser(user.value);
    router.push("/auth");
  } catch (error) {
    console.error("Delete account error:", error);
    alert("Ошибка при удалении аккаунта");
  } finally {
    closeDeleteAccountConfirm();
  }
};

// Следим за изменениями в userStore
watch(
  () => userStore.userData,
  (newData) => {
    if (newData) {
      if (newData.avatar && newData.avatar !== userAvatar.value) {
        userAvatar.value = newData.avatar;
        avatarPreview.value = newData.avatar;
      }
      if (
        newData.displayName &&
        newData.displayName !== editDisplayName.value
      ) {
        editDisplayName.value = newData.displayName;
      }
      if (newData.dailyGoal && newData.dailyGoal !== dailyGoal.value) {
        dailyGoal.value = newData.dailyGoal;
        editDailyGoal.value = newData.dailyGoal;
      }
    }
  },
  { immediate: true, deep: true },
);

// Добавляем слушатель событий
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  loadUserData();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
