<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-vue-next';

// Props
defineProps<{
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
  description?: string;
}>();
</script>

<template>
  <Alert :variant="variant || 'default'">
    <AlertCircle class="w-4 h-4" />
    <AlertTitle>{{ title || 'Success' }}</AlertTitle>
    <AlertDescription>
      {{ description || 'You have successfully completed the action.' }}
    </AlertDescription>
  </Alert>
</template>
