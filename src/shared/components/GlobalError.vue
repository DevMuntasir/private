<template>
  <div class="error-page">
    <h1>Something went wrong</h1>
    <p>{{ message }}</p>
    <button @click="goHome">Go Home</button>
  </div>
</template>

<script setup lang="ts">
import { useErrorStore } from '@/store/common/error-store'
import { useRouter } from 'vue-router'


const router = useRouter()
const errorStore = useErrorStore()
const message = errorStore.message

function goHome() {
  errorStore.clearError()
  router.push('/')
}
</script>
