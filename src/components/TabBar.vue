<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-bg-secondary-dark border-t border-border-light dark:border-border-dark flex justify-around items-center h-14 z-20 transition-colors duration-200 shadow-[0_-6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_-6px_16px_6px_rgba(0,0,0,0.4)] text-border/40"
  >
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="relative group flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-150"
      :class="{
        'text-accent': $route.path === item.path,
      }"
    >
      <component :is="item.icon" class="w-6 h-6" />
    </router-link>
  </nav>
</template>

<script setup>
import LibraryIcon from "../assets/icons/navigation/library.svg?component";
import TrackerIcon from "../assets/icons/navigation/tracker.svg?component";
import WishlistIcon from "../assets/icons/navigation/wishlist.svg?component";
import CommunityIcon from "../assets/icons/navigation/community.svg?component";

const navItems = [
  { path: "/library", label: "Библиотека", icon: LibraryIcon },
  { path: "/tracker", label: "Трекер", icon: TrackerIcon },
  { path: "/wishlist", label: "Вишлист", icon: WishlistIcon },
  { path: "/community", label: "Сообщество", icon: CommunityIcon },
];
</script>
