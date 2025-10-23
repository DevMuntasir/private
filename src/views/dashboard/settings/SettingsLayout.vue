<template>
  <div class="h-[calc(100vh-70px)] overflow-hidden relative pb-10">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-white">
      <div class="flex items-center px-6 py-4">
        <Button
          @click="goBack()"
          variant="ghost"
          size="icon"
          class="w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <h1 class="text-2xl font-semibold text-orange-highlight font-primary">
          Settings
        </h1>
        <button
          class="md:hidden ml-auto p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Menu class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="flex relative h-full pb-5">
      <!-- Sidebar -->
      <div
        :class="[
          'w-70 border-r sticky  border-gray-200 bg-white transition-transform duration-200 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'fixed md:relative z-30 ',
        ]"
      >
        <div class="p-3">
          <nav class="space-y-2">
            <router-link
              v-for="item in settingsNavItems"
              :key="item.href"
              :to="item.href"
              class="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 hover:text-gray-900"
              active-class="bg-orange-50 text-orange-600 border border-orange-200"
              exact-active-class="bg-orange-50 text-orange-600 border border-orange-200"
              @click="sidebarOpen = false"
            >
              <component :is="item.icon" class="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="font-medium">
                  {{ item.title }}
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ item.description }}
                </div>
              </div>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Overlay for mobile -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-20 md:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Main content -->
      <div class="flex-1 min-w-0 h-full overflow-auto">
        <div class="p-4">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { useGoBack } from "@/composeable/useGoBack";
import { ArrowLeft, Lock, Menu } from "lucide-vue-next";
import { ref } from "vue";
const { goBack } = useGoBack();
const sidebarOpen = ref(false);

const settingsNavItems = [
  // {
  //   title: "Profile",
  //   href: "/admin/settings/profile",
  //   icon: User,
  //   description: "Personal information",
  // },
  {
    title: "Reset Password",
    href: "/admin/settings/password",
    icon: Lock,
    description: "Update password and security",
  },
];
</script>
