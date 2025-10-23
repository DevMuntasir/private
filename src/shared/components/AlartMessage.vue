<!-- components/common/FormErrors.vue -->
<template>
  <div
    v-if="Object.keys(errors).length > 0"
    class="mb-4 rounded-md border border-red-300 bg-red-50 p-4 space-y-2"
  >
    <div class="flex items-start gap-2 text-red-700">
      <AlertCircle class="w-5 h-5 mt-1 flex-shrink-0" />
      <div class="space-y-1 text-sm leading-relaxed">
        <div
          v-for="(messages, field) in errors"
          :key="field"
          class="space-y-1"
        >
          <div
            v-for="msg in messages"
            :key="msg"
            class="flex items-start gap-1"
          >
            <span class="block">{{ msg }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";

defineProps<{
  errors: Record<string, string[]>;
}>();
</script>
