<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <router-view />
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BottomNav from "./components/TabBar.vue";

const route = useRoute();

const showBottomNav = computed(() => {
  // По умолчанию показываем, если не указано иное
  return route.meta.showBottomNav !== false;
});
</script>
