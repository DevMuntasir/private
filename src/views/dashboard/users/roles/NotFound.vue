<template>
  <div
    v-if="!roleStore?.loading && roleStore?.roles.length === 0"
    class="flex flex-col items-center h-[calc(100vh-250px)] justify-center py-16 px-4 text-center"
  >
    <!-- Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-16 w-16 text-gray-300 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 17v-1a2 2 0 00-2-2H5a2 2 0 00-2 2v1m14 0v-1a2 2 0 00-2-2h-2a2 2 0 00-2 2v1m4-10a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>

    <!-- Headline -->
    <h3 class="text-lg font-semibold text-gray-700 mb-1">No Roles Found</h3>

    <!-- Subtext -->
    <p class="text-sm text-gray-500 max-w-sm">
      We couldn't find any roles matching your criteria. Try adjusting your
      search or adding a new role.
    </p>
  </div>
</template>

<script setup>
import { useRoleStore } from '@/store/common/role-permission-store';


const roleStore = useRoleStore()
</script>

<style>
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
