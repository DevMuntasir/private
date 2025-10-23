<template>
  <transition name="route-loader-fade">
    <div v-if="isActive" class="route-loader-overlay">
      <div class="route-loader">
        <span class="dot" v-for="n in 3" :key="n"></span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouteLoaderStore } from "@/store/common/route-loader-store";

const loaderStore = useRouteLoaderStore();
const isActive = computed(() => loaderStore.active && !loaderStore.disabled);
</script>

<style scoped>
.route-loader-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
  z-index: 999;
}

.route-loader {
  background: #da0000cb;
  border-radius: 999px;
  padding: 10px 18px;
  position: absolute;
  bottom: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: dotPulse 1s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dotPulse {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.route-loader-fade-enter-active,
.route-loader-fade-leave-active {
  transition: opacity 0.25s ease;
}

.route-loader-fade-enter-from,
.route-loader-fade-leave-to {
  opacity: 0;
}
</style>
