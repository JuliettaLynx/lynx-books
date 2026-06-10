<template>
  <div class="min-h-screen bg-white dark:bg-bg-primary-dark">
    <!-- Шапка -->
    <div
      class="sticky top-0 z-20 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark"
    >
      <div class="p-3 flex justify-between items-center">
        <h1 class="text-xl font-bold dark:text-white">Сообщество</h1>
        <div class="flex gap-2">
          <IconButton icon="⚙️" @click="privacyModalOpen = true" />
          <IconButton icon="🔗" @click="shareModalOpen = true" />
          <UserProfile />
        </div>
      </div>
      <div class="p-3 pt-0">
        <SearchInput v-model="searchQuery" placeholder="Поиск подписок..." />
      </div>
    </div>

    <IconButton
      icon="+"
      variant="primary"
      @click="addModalOpen = true"
      class="fixed z-20 right-4 bottom-20 w-14 h-14 bg-accent text-white dark:text-black rounded-full shadow-lg hover:bg-accent/60 text-2xl flex items-center justify-center"
    />

    <div v-if="communityStore.loading" class="text-center py-8">
      Загрузка...
    </div>
    <div v-else-if="communityStore.error" class="text-center py-8 text-red-500">
      Ошибка: {{ communityStore.error }}
    </div>
    <div
      v-else-if="filteredSubscriptions.length === 0"
      class="text-center py-8 text-gray-500"
    >
      У вас пока нет подписок. Используйте кнопку "+", чтобы найти друзей.
    </div>
    <div v-else class="p-4 space-y-3">
      <SubscriptionCard
        v-for="sub in subscriptionsWithPreviews"
        :key="sub.userId"
        :subscription="sub"
        :libraryBooks="sub.libraryBooks"
        :wishlistBooks="sub.wishlistBooks"
        @unsubscribe="handleUnsubscribe"
        @open-library="openUserList(sub.userId, 'library')"
        @open-wishlist="openUserList(sub.userId, 'wishlist')"
      />
    </div>

    <PrivacyModal v-model="privacyModalOpen" />
    <ShareModal v-model="shareModalOpen" />
    <AddUserModal
      v-model="addModalOpen"
      :initial-token="route.query.share"
      @added="refreshSubscriptions"
    />
    <ExternalListView
      :is-open="externalViewOpen"
      :user-id="externalUserId"
      :list-type="externalListType"
      :user-name="externalUserInfo?.displayName"
      @close="externalViewOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { auth } from "../firebase/config";
import { useCommunityStore } from "../stores/community";
import IconButton from "../components/IconButton.vue";
import SearchInput from "../components/library/SearchInput.vue";
import UserProfile from "../components/UserProfile.vue";
import PrivacyModal from "../components/community/PrivacyModal.vue";
import ShareModal from "../components/community/ShareModal.vue";
import AddUserModal from "../components/community/AddUserModal.vue";
import SubscriptionCard from "../components/community/SubscriptionCard.vue";
import ExternalListView from "../components/community/ExternalListView.vue";

const communityStore = useCommunityStore();
const { subscriptions, loading, error } = storeToRefs(communityStore);
const { loadSubscriptions, loadPrivacy, unsubscribe } = communityStore;
const route = useRoute();

const searchQuery = ref("");
const privacyModalOpen = ref(false);
const shareModalOpen = ref(false);
const addModalOpen = ref(false);
const externalViewOpen = ref(false);
const externalUserId = ref("");
const externalListType = ref("");
const externalUserInfo = ref(null);
const subscriptionPreviews = ref({});

const filteredSubscriptions = computed(() => {
  if (!searchQuery.value) return subscriptions.value;
  const q = searchQuery.value.toLowerCase();
  return subscriptions.value.filter((s) =>
    s.displayName.toLowerCase().includes(q),
  );
});

const subscriptionsWithPreviews = computed(() => {
  return subscriptions.value.map((sub) => ({
    ...sub,
    libraryBooks: subscriptionPreviews.value[sub.userId]?.libraryBooks || [],
    wishlistBooks: subscriptionPreviews.value[sub.userId]?.wishlistBooks || [],
  }));
});

const loadPreviews = async () => {
  for (const sub of subscriptions.value) {
    const previews = {};
    if (sub.hasLibraryAccess) {
      try {
        const books = await communityStore.fetchUserLibrary(sub.userId);
        previews.libraryBooks = books.slice(0, 4);
      } catch {}
    }
    if (sub.hasWishlistAccess) {
      try {
        const books = await communityStore.fetchUserWishlist(sub.userId);
        previews.wishlistBooks = books.slice(0, 4);
      } catch {}
    }
    subscriptionPreviews.value[sub.userId] = previews;
  }
};

const refreshSubscriptions = async () => {
  if (!auth.currentUser) return;
  await loadPrivacy();
  await loadSubscriptions();
  await loadPreviews();
};

const openUserList = (userId, listType) => {
  externalUserId.value = userId;
  externalListType.value = listType;
  const sub = subscriptions.value.find((s) => s.userId === userId);
  externalUserInfo.value = sub ? { displayName: sub.displayName } : null;
  externalViewOpen.value = true;
};

const handleUnsubscribe = async (userId) => {
  await unsubscribe(userId);
  await refreshSubscriptions();
};

onMounted(() => {
  if (auth.currentUser) {
    refreshSubscriptions();
  }
  if (route.query.share) addModalOpen.value = true;
});
</script>
