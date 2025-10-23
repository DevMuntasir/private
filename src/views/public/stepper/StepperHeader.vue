<template>
  <header
    class="py-3 w-full bg-white font-primary h-[70px] px-4 lg:px-8 sticky top-0 border-b z-50 flex justify-between items-center"
  >
    <RouterLink to="/private/overview" class="flex items-center gap-3">
      <img src="/logo/Logo.svg" alt="Chutney Ads" class="max-w-[160px]" />
    </RouterLink>

    <div class="text-sm text-gray-600">
      {{ userName }}
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/user-store";


const userStore = useUserStore();
const { authUser } = storeToRefs(userStore);

const userName = computed(() => authUser.value?.data?.name ?? "");
</script>

