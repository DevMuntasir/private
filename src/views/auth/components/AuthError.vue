<script setup>
import { AlertCircleIcon } from 'lucide-vue-next';

const { authStore } = defineProps({
  authStore: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    v-if="authStore.error"
    class="bg-red-50 border border-red-200 rounded-md p-4"
  >
    <div class="flex">
      <AlertCircleIcon class="h-5 w-5 text-red-400" />
      <div class="ml-3">
        <p class="text-sm text-red-800">{{ authStore.error }}</p>
      </div>
    </div>
  </div>
</template>
