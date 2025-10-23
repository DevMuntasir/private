<template>
  <transition name="preloader-fade">
    <div v-if="visible" class="preloader-overlay">
      <div class="preloader-card">
        <img src="/logo/Logo.svg" alt="ChutneyAds" class="preloader-logo" />
        <div class="preloader-spinner"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean }>();
</script>

<style scoped>
.preloader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.preloader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 32px 48px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.preloader-logo {
  height: 64px;
  width: auto;
}

.preloader-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(227, 83, 36, 0.25);
  border-top-color: #e35324;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.preloader-fade-enter-active,
.preloader-fade-leave-active {
  transition: opacity 0.25s ease;
}

.preloader-fade-enter-from,
.preloader-fade-leave-to {
  opacity: 0;
}
</style>
