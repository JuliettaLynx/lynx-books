<template>
  <div class="min-h-screen bg-white dark:bg-bg-primary-dark">
    <!-- Шапка -->
    <div
      class="sticky top-0 pl-4 p-1.5 z-20 border-b border-border dark:border-border-dark bg-white dark:bg-bg-secondary-dark shadow-[0_6px_16px_6px_rgba(71,0,102,0.1)] dark:shadow-[0_6px_16px_6px_rgba(0,0,0,0.4)] transition-colors duration-200"
    >
      <div class="flex justify-between items-center">
        <SearchInput v-model="searchQuery" placeholder="Имя пользователя" />
        <IconButton icon="⚙️" @click="privacyModalOpen = true" class="px-3" />
        <IconButton icon="🔗" @click="shareModalOpen = true" class="pr-3" />
      </div>

      <IconButton
        icon="+"
        variant="primary"
        @click="addModalOpen = true"
        class="fixed z-20 right-4 bottom-20 lg:bottom-5 w-14 h-14 bg-accent text-white dark:text-black rounded-full shadow-lg hover:bg-accent/60 text-2xl flex items-center justify-center"
      />
    </div>

    <div v-if="communityStore.loading" class="text-center py-8">
      <LoadingSpinner />
    </div>

    <div v-else-if="communityStore.error" class="text-center py-8 text-red-500">
      Ошибка: {{ communityStore.error }}
    </div>
    <div
      v-else-if="filteredSubscriptions.length === 0"
      class="text-center p-8 text-gray-500"
    >
      У вас пока нет подписок. Используйте кнопку "+", чтобы найти друзей.
    </div>

    <div
      v-else
      class="p-4 grid gap-3 grid-cols-1 min-[700px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1350px]:grid-cols-4 min-[1600px]:grid-cols-5 min-[2000px]:grid-cols-6 min-[2400px]:grid-cols-7 min-[3000px]:grid-cols-8"
    >
      <SubscriptionCard
        v-for="sub in subscriptionsWithPreviews"
        :key="sub.userId"
        :subscription="sub"
        :libraryBooks="sub.libraryBooks"
        :wishlistBooks="sub.wishlistBooks"
        :loading-library="sub.loadingLibrary"
        :loading-wishlist="sub.loadingWishlist"
        @unsubscribe="handleUnsubscribe"
        @open-library="openUserList(sub.userId, 'library')"
        @open-wishlist="openUserList(sub.userId, 'wishlist')"
        @open-book="openBookModal"
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
    <ReadonlyBookModal
      :is-open="showBookModal"
      :book="selectedBook"
      :list-type="selectedListType"
      @close="showBookModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { auth } from "../firebase/config";
import { useCommunityStore } from "../stores/community";
import IconButton from "../components/IconButton.vue";
import SearchInput from "../components/library/SearchInput.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import UserProfile from "../components/UserProfile.vue";
import PrivacyModal from "../components/community/PrivacyModal.vue";
import ShareModal from "../components/community/ShareModal.vue";
import AddUserModal from "../components/community/AddUserModal.vue";
import SubscriptionCard from "../components/community/SubscriptionCard.vue";
import ReadonlyBookModal from "../components/community/ReadonlyBookModal.vue";
import ExternalListView from "../components/community/ExternalListView.vue";

const communityStore = useCommunityStore();
const { subscriptions, loading, error } = storeToRefs(communityStore);
const { loadSubscriptions, loadPrivacy, unsubscribe } = communityStore;
const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const privacyModalOpen = ref(false);
const shareModalOpen = ref(false);
const addModalOpen = ref(false);
const externalViewOpen = ref(false);
const externalUserId = ref("");
const externalListType = ref("");
const externalUserInfo = ref(null);
const subscriptionPreviews = ref({});
const loadingPreviews = ref({});

const selectedBook = ref(null);
const showBookModal = ref(false);
const selectedListType = ref("");

const openBookModal = ({ book, listType }) => {
  selectedBook.value = book;
  selectedListType.value = listType;
  showBookModal.value = true;
};

const filteredSubscriptions = computed(() => {
  if (!searchQuery.value) return subscriptions.value;
  const q = searchQuery.value.toLowerCase();
  return subscriptions.value.filter((s) =>
    s.displayName.toLowerCase().includes(q),
  );
});

const subscriptionsWithPreviews = computed(() => {
  return subscriptions.value.map((sub) => {
    const lp = loadingPreviews.value[sub.userId];
    return {
      ...sub,
      libraryBooks: subscriptionPreviews.value[sub.userId]?.libraryBooks || [],
      wishlistBooks:
        subscriptionPreviews.value[sub.userId]?.wishlistBooks || [],
      loadingLibrary: lp?.library ?? true,
      loadingWishlist: lp?.wishlist ?? true,
    };
  });
});

const loadPreviews = async () => {
  for (const sub of subscriptions.value) {
    const userId = sub.userId;
    loadingPreviews.value[userId] = { library: true, wishlist: true };
    subscriptionPreviews.value[userId] = {
      libraryBooks: [],
      wishlistBooks: [],
    };
  }

  for (const sub of subscriptions.value) {
    const userId = sub.userId;

    if (sub.hasLibraryAccess) {
      try {
        const books = await communityStore.fetchUserLibrary(userId);
        subscriptionPreviews.value[userId].libraryBooks = books;
      } catch {}
    } else {
      subscriptionPreviews.value[userId].libraryBooks = [];
    }
    loadingPreviews.value[userId].library = false;

    if (sub.hasWishlistAccess) {
      try {
        const books = await communityStore.fetchUserWishlist(userId);
        subscriptionPreviews.value[userId].wishlistBooks = books;
      } catch {}
    } else {
      subscriptionPreviews.value[userId].wishlistBooks = [];
    }
    loadingPreviews.value[userId].wishlist = false;
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
  window.history.pushState({ modal: true }, "");
};

const handleUnsubscribe = async (userId, listType = null) => {
  await unsubscribe(userId, listType);
  await refreshSubscriptions();
};

const handlePopState = () => {
  if (externalViewOpen.value) {
    externalViewOpen.value = false;
  }
};

onMounted(() => {
  if (auth.currentUser) {
    refreshSubscriptions();
  }
  if (route.query.share) addModalOpen.value = true;
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  window.removeEventListener("popstate", handlePopState);
});
</script>
