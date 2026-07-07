<template>
  <div
    class="min-h-screen bg-white dark:bg-bg-primary-dark transition-colors duration-200"
  >
    <div
      class="flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style="min-height: calc(100vh - 120px)"
    >
      <div class="max-w-md w-full text-center">
        <!-- 404 текст -->
        <div class="space-y-2">
          <h1
            class="text-9xl text-border-dark/60 font-bold dark:text-border/60 tracking-wider"
          >
            404
          </h1>
          <div
            class="w-16 h-px bg-border dark:bg-border-dark mx-auto my-6"
          ></div>
          <h2 class="text-3xl font-light text-gray-600 dark:text-gray-300 mb-2">
            Страница не найдена
          </h2>
          <p class="text-gray-400 dark:text-gray-500 font-light text-xl mb-8">
            Страница, которую вы ищете, не существует или была перемещена
          </p>
        </div>

        <!-- Кнопки навигации -->
        <div class="flex flex-wrap gap-3 justify-center mt-8">
          <IconButton
            icon="📚"
            class="px-6 py-3 text-lg bg-white dark:bg-bg-secondary-dark border border-border dark:border-border-dark hover:bg-purple-700/10 dark:hover:bg-border-dark"
            @click="goToLibrary"
          >
            Библиотека
          </IconButton>

          <IconButton
            icon="📊"
            class="px-6 py-3 text-lg bg-white dark:bg-bg-secondary-dark border border-border dark:border-border-dark hover:bg-purple-700/10 dark:hover:bg-border-dark"
            @click="goToTracker"
          >
            Трекер
          </IconButton>

          <IconButton
            icon="🎁"
            class="px-6 py-3 text-lg bg-white dark:bg-bg-secondary-dark border border-border dark:border-border-dark hover:bg-purple-700/10 dark:hover:bg-border-dark"
            @click="goToWishlist"
          >
            Вишлист
          </IconButton>

          <IconButton
            icon="👥"
            class="px-6 py-3 text-lg bg-white dark:bg-bg-secondary-dark border border-border dark:border-border-dark hover:bg-purple-700/10 dark:hover:bg-border-dark"
            @click="goToCommunity"
          >
            Сообщество
          </IconButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import IconButton from "../components/IconButton.vue";

const router = useRouter();

const goToLibrary = () => router.push("/library");
const goToTracker = () => router.push("/tracker");
const goToWishlist = () => router.push("/wishlist");
const goToCommunity = () => router.push("/community");
</script>
