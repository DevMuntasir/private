<template>
  <Toaster />
  <RouteProgress />
  <main class="main-content">
    <RouterView v-if="ready" v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>

    <LogoPreloader v-else />
  </main>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { RouterView } from "vue-router";
import { Toaster } from "./components/ui/sonner";
import RouteProgress from "./components/ui/RouteProgress.vue";
import { useAuthStore } from "./store/auth-store";
import { useRoleStore } from "./store/common/role-permission-store";
import "vue-sonner/style.css";
import "leaflet/dist/leaflet.css";
import LogoPreloader from "./components/ui/LogoPreloader.vue";
import { useUserStore } from "./store/user-store";

const authStore = useAuthStore();
const userStore = useUserStore();
const roleStore = useRoleStore();
const ready = ref(false);

watchEffect(async () => {
  if (authStore.isAuthenticated && !roleStore.permissionLoaded ) {
    await roleStore.fetchSignlePermissions();
    await userStore.fetchAuthUserInfo();
  }
  ready.value = true;
});
</script>


<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
