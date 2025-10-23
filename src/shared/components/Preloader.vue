<!-- components/Preloader.vue -->
<template>
  <div class="preloader">
    <div class="spinner"></div>
  </div>
</template>

<script setup></script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #333;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
