<template>
  <div class="space-y-2">
    <div
      v-for="row in rows"
      :key="row"
      class="flex items-center gap-4 px-4 py-3 rounded-md "
    >
     

      <div class="flex items-center gap-3 w-[220px]">
        <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div class="flex flex-col gap-1">
          <div class="w-24 h-4 rounded bg-gray-200 animate-pulse"></div>
          <div class="w-28 h-3 rounded bg-gray-100 animate-pulse"></div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 w-[220px]">
        <div
          v-for="i in getRandom(1, 3)"
          :key="i"
          class="h-6 rounded-full bg-gray-200 animate-pulse"
          :style="{ width: `${getRandom(60, 100)}px` }"
        ></div>
      </div>

      <div class="w-[180px]">
        <div class="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div class="w-[140px]">
        <div class="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div class="w-[80px]">
        <div class="w-14 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <div class="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
        <div class="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rows: number
}>()

function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
</script>
