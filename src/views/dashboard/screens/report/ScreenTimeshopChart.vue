<template>
  <div class="w-1/2  bg-[#decbaa] p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[18px] font-semibold font-primary">Time Shop Report</h3>
      <RouterLink :to="{
        name:'timeshop'
      }" class="text-[#e11d25] text-sm font-semibold hover:underline">
        View details
      </RouterLink>
    </div>

    <!-- Chart -->
    <div class="relative h-[250px]">
      <!-- dotted horizontal guides to mimic screenshot -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="h-full flex flex-col justify-between opacity-60">
          <div v-for="n in 7" :key="n" class="border-t border-dotted border-[#cbb896]"></div>
        </div>
      </div>
      <canvas ref="chartEl"></canvas>
    </div>

    <!-- Legend -->
    <div class="mt-5 flex items-center gap-10 text-[16px]">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.open }"></span>
        <span class="text-[#6b6b6b]">Open</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.close }"></span>
        <span class="text-[#6b6b6b]">Close</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

type Row = { dateLabel: string; open: number; close: number }

// sample data to match the screenshot proportions (hours out of 24)
const rows = ref<Row[]>([
  { dateLabel: 'May 18, 2025', open: 18, close: 4 },
  { dateLabel: 'May 19, 2025', open: 22, close: 2 },
  { dateLabel: 'May 20, 2025', open: 16, close: 8 },
])

const colors = {
  open: '#f39c12',   // orange
  close: '#e53935',  // red
}

const labels = computed(() => rows.value.map(r => r.dateLabel))
const openData = computed(() => rows.value.map(r => r.open))
const closeData = computed(() => rows.value.map(r => r.close))

const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function buildConfig() {
  return {
    type: 'bar' as const,
    data: {
      labels: labels.value,
      datasets: [
        {
          label: 'Open',
          data: openData.value,
          backgroundColor: colors.open,
          borderWidth: 0,
          borderRadius: 2,
          barThickness: 46,
          stack: 'hours',
        },
        {
          label: 'Close',
          data: closeData.value,
          backgroundColor: colors.close,
          borderWidth: 0,
          borderRadius: 2,
          barThickness: 46,
          stack: 'hours',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: {
            color: '#6b6b6b',
            font: { size: 12 },
          },
          border: { display: false },
        },
        y: {
          stacked: true,
          min: 0,
          max: 24,
          ticks: {
            display: false, // screenshot এ টিকস দেখা যায় না
          },
          border: { display: false },
          grid: {
            color: '#cbb896',     // dotted look
            borderDash: [2, 4],
            drawTicks: false,
          },
        },
      },
    },
  }
}

onMounted(() => {
  if (!chartEl.value) return
  chart = new Chart(chartEl.value, buildConfig())
})

watch([labels, openData, closeData], () => {
  if (!chart) return
  chart.data.labels = labels.value
  chart.data.datasets[0].data = openData.value
  chart.data.datasets[1].data = closeData.value
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())
</script>
