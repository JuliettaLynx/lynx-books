<!-- 404.vue -->
<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Шапка как в LibraryView -->
    <div
      class="sticky top-0 bg-white dark:bg-gray-800 z-20 border-b dark:border-gray-700 transition-colors duration-200"
    >
      <div class="p-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold dark:text-white">404</h1>
          <div class="flex gap-2">
            <!-- Кнопка переключения темы -->
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>

    <!-- Контент 404 -->
    <div
      class="flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style="min-height: calc(100vh - 120px)"
    >
      <div class="max-w-md w-full text-center">
        <!-- 404 текст -->
        <div class="space-y-2">
          <h1
            class="text-9xl font-normal text-gray-400 dark:text-gray-600 tracking-wider"
          >
            404
          </h1>
          <div
            class="w-16 h-px bg-gray-200 dark:bg-gray-700 mx-auto my-6"
          ></div>
          <h2 class="text-3xl font-light text-gray-600 dark:text-gray-300 mb-2">
            Страница не найдена
          </h2>
          <p class="text-gray-400 dark:text-gray-500 font-light text-xl mb-8">
            Страница, которую вы ищете, не существует или была перемещена
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ThemeToggle from "../components/ThemeToggle.vue";
</script>
