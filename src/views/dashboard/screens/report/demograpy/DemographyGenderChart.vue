<template>
  <div class="w-1/2 bg-[#e6d3b4] rounded-md p-8">
    <h3 class="text-[#c17b1e] font-semibold mb-6 font-primary">Total Gender</h3>

    <div class="grid grid-cols-2 gap-y-10">
      <div class="flex flex-col items-start gap-8">
        <div class="relative w-[200px] h-[200px] rounded-full bg-[#ff5a1f] flex items-center justify-center">
          <span class="text-white text-5xl font-primary font-extrabold leading-none">{{ male }}%</span>
        </div>
        <div class="relative w-[200px] h-[200px] rounded-full bg-[#4b4b4b] flex items-center justify-center">
          <span class="text-white text-5xl font-primary font-extrabold leading-none">{{ female }}%</span>
        </div>
      </div>

      <div class="flex flex-col justify-between">
        <img class=" max-h-[210px]" src="/public/dashboard/men.svg" alt="">
        <img class=" max-h-[210px]" src="/public/dashboard/women.svg" alt="">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const male = 45;
const female = 55;
// চাইলে এগুলো props করে নিন:
// defineProps<{ male: number; female: number }>()
</script>
 