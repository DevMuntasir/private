<script setup>
import { CheckCircleIcon } from 'lucide-vue-next';

const { successMessage } = defineProps({
  successMessage: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <!-- Success -->
  <div
    v-if="successMessage"
    class="bg-green-50 border border-green-200 rounded-md p-4"
  >
    <div class="flex">
      <CheckCircleIcon class="h-5 w-5 text-green-400" />
      <div class="ml-3">
        <p class="text-sm text-green-800">{{ successMessage }}</p>
      </div>
    </div>
  </div>
</template>
