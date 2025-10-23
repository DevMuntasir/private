<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  stickyFirstColumn?: boolean;
  stickyLastColumn?: boolean;
  stickyTop?: boolean;
}>();
</script>

<template>
  <th
    data-slot="table-head"
    :class="
      cn(
        'h-10 p-4 text-left align-middle font-medium font-primary whitespace-nowrap',
        'text-gray-800',
        props.class,
        props.stickyTop && ' top-0 z-30 bg-table-header',
        props.stickyFirstColumn && ' left-0  bg-table-header',
        props.stickyLastColumn && 'sticky right-0 z-40 bg-table-header'
      )
    "
  >
    <slot />
  </th>
</template>
