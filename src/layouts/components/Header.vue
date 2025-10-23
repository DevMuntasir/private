<script setup>
import { SidebarTrigger } from "@/components/ui/sidebar";

import HeaderMenu from "./HeaderMenu.vue";
import { useUserStore } from "@/store/user-store";
const userStore = useUserStore()
defineProps({
  sidebar: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div v-if="sidebar"
    class="py-3 w-full bg-white font-primary h-[70px] px-3 md:px-5 lg:px-8 sticky top-0 border-b-[1px] z-50 flex justify-between items-center">
    <div class="hidden md:flex items-center gap-2 md:gap-4">
      <RouterLink to="/admin">
        <img src="/logo/Logo.svg" alt="logo" class="max-w-[140px] md:max-w-[200px]" />
      </RouterLink>
      <SidebarTrigger size="4" />
    </div>
    <SidebarTrigger class="md:hidden" size="4" />
    <RouterLink to="/admin" class="flex md:hidden items-center">
      <img src="/logo/Logo.svg" alt="logo" class="max-w-[140px] md:max-w-[200px]" />
    </RouterLink>

    <div class="flex items-center gap-10">
      <!-- <span class="hidden md:flex font-secondary-bold text-gray-500 items-center gap-2">
        <HelpCircle /> Help
      </span> -->
      <div class="flex gap-2 items-center">
        <span class="hidden md:block font-secondary-bold text-gray-500 capitalize">
          {{ userStore.authUser.data.name }}
        </span>
        <HeaderMenu />
      </div>
    </div>
  </div>

</template>
