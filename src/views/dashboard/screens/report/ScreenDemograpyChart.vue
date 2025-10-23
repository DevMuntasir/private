<template>
  <div
    class="w-1/2 h-[420px] bg-[#decbaa] overflow-hidden  p-5"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-[18px] font-primary font-semibold text-[#4b4b4b]">Demography Report</h3>
      <RouterLink :to="{
        name:'demography'
      }" class="text-[#e11d25] text-sm font-semibold hover:underline">
        View details
      </RouterLink>
    </div>

    <!-- Chart area -->
    <div class="relative">
      <!-- light dotted lines background to mimic screenshot -->
      <div class="absolute inset-0 pt-6">
        <div class="h-full flex flex-col justify-between opacity-50">
          <div v-for="n in 7" :key="n" class="border-t border-dotted border-[#cbb896]"></div>
        </div>
      </div>

      <!-- Bar chart -->
      <div class="relative h-[260px]">
        <canvas ref="chartEl"></canvas>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 flex items-center gap-8 text-[18px]">
      <div class="flex items-center gap-3">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.credit }"></span>
        <span class="text-[#6b6b6b]">Credit Card</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.bank }"></span>
        <span class="text-[#6b6b6b]">Bank Transfer</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { buildConfig, mountChart } from "@/lib/utils";
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";


const colors = { credit: "#ff5a1f", bank: "#4b4b4b" };
const chartEl = ref<HTMLCanvasElement | null>(null);
let destroy: (() => void) | null = null;

onMounted(async () => {
  await nextTick();
  if (!chartEl.value) return;

  const config = buildConfig({
    type: "bar",
    labels: ["Credit Card", "Bank Transfer"],
    datasets: [
      {
        data: [40, 90],
        backgroundColor: [colors.credit, colors.bank],
        borderWidth: 0,
        borderRadius: 2,
        barThickness: 48,
      },
    ],
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { display: false },
          border: { display: false },
          grid: { color: "#cbb896", drawTicks: false },
        },
      },
    },
  });

  const mounted = mountChart(chartEl.value, config);
  destroy = mounted.destroy;
});

onBeforeUnmount(() => destroy?.());
</script>

