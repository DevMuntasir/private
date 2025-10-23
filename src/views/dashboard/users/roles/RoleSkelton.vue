<template>
  <div
    v-if="roleStore.loading"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    <div
      v-for="n in 6"
      :key="n"
      class="border rounded-none p-5 shadow-sm bg-white animate-pulse flex flex-col justify-between space-y-4"
    >
      <div>
        <div class="h-4 w-32 bg-gray-200 rounded mb-2"></div>
        <div class="h-6 w-48 bg-gray-300 rounded mb-1"></div>
        <div class="h-4 w-40 bg-gray-200 rounded mt-2"></div>
      </div>
      <div class="mt-6 flex space-x-2">
        <div class="h-9 w-20 bg-gray-200 rounded"></div>
        <div class="h-9 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoleStore } from '@/store/common/role-permission-store';

defineProps({
isLoading:Boolean
})
const roleStore = useRoleStore()

</script>
