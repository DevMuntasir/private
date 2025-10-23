<template>
  <div class="flex items-center gap-2">
    <span :class="statusClass(status?.label, 'dot')" />
    <span :class="statusClass(status?.label, 'text')">
      {{ status?.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useStatusColor } from '@/composeable/useStatusColor';



interface Props {
  status: {
    value: number,
    label:string
  }

}

 defineProps<Props>();
const { statusClass } = useStatusColor();
</script>
