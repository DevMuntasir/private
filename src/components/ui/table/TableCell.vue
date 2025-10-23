<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  stickyFirstColumn?: boolean,
  stickyLastColumn?:boolean
}>()
</script>

<template>
  <td
    v-bind="$attrs"
    data-slot="table-cell"
    :class="cn(
      'p-5 align-middle !border-r-[1px] !border-b-[1px] text-left border-table-header/70 whitespace-nowrap text-gray-700',
      props.class,
      props.stickyFirstColumn && 'sticky left-0 z-20 bg-white',
         props.stickyLastColumn && 'sticky right-0 z-20 bg-white'
    )"
  >
    <slot />
  </td>
</template>
