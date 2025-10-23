<template>
  <div
    class="w-[360px] h-[420px] bg-[#decbaa] overflow-hidden  p-5"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-[22px] font-semibold text-[#4b4b4b]">Payment Methods</h3>
      <button type="button" class="text-[#e11d25] text-sm font-semibold hover:underline">
        View details
      </button>
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
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import Chart from "chart.js/auto";

type PaymentData = {
  creditCard: number;
  bankTransfer: number;
};

// sample values chosen to resemble the screenshot proportions
const data = ref<PaymentData>({ creditCard: 40, bankTransfer: 90 });

const colors = {
  credit: "#ff5a1f", // vivid orange
  bank: "#4b4b4b",   // dark gray
};

const chartEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const chartData = computed(() => ({
  labels: ["Credit Card", "Bank Transfer"],
  datasets: [
    {
      data: [data.value.creditCard, data.value.bankTransfer],
      backgroundColor: [colors.credit, colors.bank],
      borderColor: [colors.credit, colors.bank],
      borderWidth: 0,
      borderRadius: 2,
      barThickness: 48,
    },
  ],
}));

onMounted(() => {
  if (!chartEl.value) return;

  chart = new Chart(chartEl.value, {
    type: "bar",
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { display: false }, // hide x labels (legend below covers it)
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: { display: false },   // hide ticks to match clean look
          border: { display: false },
          grid: {
            color: "#cbb896",

            drawTicks: false,
          },
        },
      },
    },
  });
});

watch(chartData, (val) => {
  if (chart) {
    chart.data = val;
    chart.update();
  }
});

onBeforeUnmount(() => chart?.destroy());
</script>
