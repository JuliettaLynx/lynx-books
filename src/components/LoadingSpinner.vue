<template>
  <div
    class="flex flex-col items-center justify-center pt-5"
    :class="{
      'fixed inset-0 bg-white dark:bg-bg-primary-dark z-50': fullscreen,
    }"
  >
    <div class="text-center">
      <img
        src="../../public/loading.png"
        alt="Loading..."
        class="w-10 h-10 mb-4 animate-spin"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  fullscreen: {
    type: Boolean,
    default: false,
  },
});
</script>
