<template>
  <div
    ref="trackerContainer"
    class="min-h-screen bg-white dark:bg-bg-primary-dark transition-colors duration-200 touch-pan-y"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Шапка -->
    <div
      class="sticky top-0 z-20 border-b border-border dark:border-border-dark bg-bg-secondary dark:bg-bg-secondary-dark text-black dark:text-bg-secondary shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)] transition-colors duration-200"
    >
      <!-- Месяц с навигацией -->
      <div
        class="flex items-center justify-between px-4 min-[700px]:px-5 text-white"
      >
        <button type="button" @click="prevMonth" class="text-white">
          <ArrowIcon class="w-5 h-5 text-white" />
        </button>

        <h2
          class="pb-2.5 pt-3 text-lg font-semibold dark:text-white capitalize"
        >
          {{ currentMonthName }}
        </h2>

        <button type="button" @click="nextMonth" class="text-white">
          <ArrowIcon class="w-5 h-5 text-white scale-x-[-1]" />
        </button>
      </div>

      <button
        @click="openYearPicker"
        class="px-3 py-0.5 top-2.5 right-16 absolute dark:text-white text-base font-bold border border-border dark:border-border-dark rounded-lg transition-colors"
      >
        {{ currentYear }}
      </button>

      <!-- Кнопка добавления сессии -->
      <button
        @click="openSessionModal"
        class="fixed bottom-20 lg:bottom-5 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-lg bg-accent hover:bg-[#25917b] text-2xl text-white dark:text-bg-primary-dark shadow-lg transition-colors duration-200"
      >
        <PlusIcon class="w-5 h-5" />
      </button>
    </div>

    <div v-if="sessionStore.error" class="p-4 text-center">
      <p class="text-red-500 dark:text-red-400">
        Ошибка: {{ sessionStore.error }}
      </p>
      <button
        @click="loadSessions"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Повторить
      </button>
    </div>

    <!-- Календарь -->
    <div v-if="!sessionStore.loading" class="p-4">
      <CalendarGrid
        :year="currentYear"
        :month="currentMonth"
        @day-click="handleCalendarClick"
      />
    </div>

    <!-- Модальные окна -->
    <SessionModal
      :is-open="isSessionModalOpen"
      :initial-date="selectedDate"
      :session-to-edit="sessionToEdit"
      @close="closeSessionModal"
      @saved="onSessionSaved"
    />

    <YearPickerModal
      :is-open="isYearPickerOpen"
      :current-year="currentYear"
      @close="closeYearPicker"
      @select="changeYear"
    />

    <DayDetailsModal
      :is-open="isDayDetailsOpen"
      :date="selectedDate"
      @close="closeDayDetails"
      @session-updated="onSessionUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { auth } from "../firebase/config";
import { useSessionStore } from "../stores/session";
import UserProfile from "../components/UserProfile.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import CalendarGrid from "../components/tracker/CalendarGrid.vue";
import SessionModal from "../components/tracker/SessionModal.vue";
import DayDetailsModal from "../components/tracker/DayDetailsModal.vue";
import YearPickerModal from "../components/tracker/YearPickerModal.vue";

import ArrowIcon from "../assets/icons/arrow.svg?component";
import PlusIcon from "../assets/icons/plus.svg?component";

const SWIPE_THRESHOLD = 50;
const MOVE_THRESHOLD = 10;

const sessionStore = useSessionStore();

// Состояние
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDate = ref(new Date());
const isSessionModalOpen = ref(false);
const isDayDetailsOpen = ref(false);
const isYearPickerOpen = ref(false);
const sessionToEdit = ref(null);

const touchState = ref({
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  hasMoved: false,
  isHorizontalSwipe: false,
});

// ========== Вычисляемые свойства ==========
const currentMonthName = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleString("ru", {
    month: "long",
  }),
);

// ========== Навигация по месяцам ==========
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const changeYear = (year) => {
  currentYear.value = year;
  closeYearPicker();
};

// ========== Свайпы ==========
const onTouchStart = (event) => {
  if (isSessionModalOpen.value) return;
  const touch = event.touches[0];
  if (!touch) return;
  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    currentY: touch.clientY,
    hasMoved: false,
    isHorizontalSwipe: false,
  };
};

const onTouchMove = (event) => {
  if (isSessionModalOpen.value) return;
  const touch = event.touches[0];
  if (!touch) return;
  const deltaX = Math.abs(touch.clientX - touchState.value.startX);
  const deltaY = Math.abs(touch.clientY - touchState.value.startY);
  if (
    !touchState.value.hasMoved &&
    (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD)
  ) {
    touchState.value.hasMoved = true;
  }
  if (touchState.value.hasMoved && deltaX > deltaY && deltaX > MOVE_THRESHOLD) {
    touchState.value.isHorizontalSwipe = true;
    event.preventDefault();
  }
  touchState.value.currentX = touch.clientX;
  touchState.value.currentY = touch.clientY;
};

const onTouchEnd = () => {
  if (isSessionModalOpen.value) return;
  if (!touchState.value.hasMoved) {
    resetTouchState();
    return;
  }
  if (touchState.value.isHorizontalSwipe) {
    const deltaX = touchState.value.currentX - touchState.value.startX;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) prevMonth();
      else nextMonth();
    }
  }
  resetTouchState();
};

const resetTouchState = () => {
  touchState.value = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    hasMoved: false,
    isHorizontalSwipe: false,
  };
};

// ========== Модалки ==========
const openSessionModal = (date = new Date()) => {
  selectedDate.value = date;
  sessionToEdit.value = null;
  isSessionModalOpen.value = true;
};
const closeSessionModal = () => (isSessionModalOpen.value = false);

const openDayDetails = (date) => {
  selectedDate.value = date;
  isDayDetailsOpen.value = true;
};
const closeDayDetails = () => (isDayDetailsOpen.value = false);
const handleCalendarClick = (date) => {
  if (touchState.value.hasMoved) return;
  openDayDetails(date);
};

const openYearPicker = () => (isYearPickerOpen.value = true);
const closeYearPicker = () => (isYearPickerOpen.value = false);

const onSessionSaved = () => closeSessionModal();
const onSessionUpdated = () => {};

const loadSessions = () => {
  if (auth.currentUser) {
    sessionStore.initSync(auth.currentUser.uid);
  }
};

onMounted(() => {
  loadSessions();
});
</script>
