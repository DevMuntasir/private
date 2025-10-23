<template>
  <SidebarProvider>
    <div class="w-full relative">
      <Header />
      <div class="flex relative">
        <AdminSidebar>
          <RouterView v-slot="{ Component, route }">
            <Suspense>
              <component :is="Component" :key="route.path" />
              <template #fallback>
                <Preloader />
              </template>
            </Suspense>
          </RouterView>
        </AdminSidebar>
      </div>
    </div>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar.vue";
import Header from "./components/Header.vue";
import Preloader from "@/shared/components/Preloader.vue";
</script>
