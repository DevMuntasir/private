<!-- OpenCloseStatisticCard.vue -->
<template>
  <div class="w-full  bg-[#decbaa]  p-6">
    <h3 class="text-[#c17b1e] font-semibold mb-4">Open Close Statistic</h3>

    <div class="relative h-[300px]">
      <!-- dotted horizontal guides -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="h-full flex flex-col justify-between opacity-60">
          <div v-for="n in 7" :key="n" class="border-t border-dotted border-[#cbb896]"></div>
        </div>
      </div>

      <canvas ref="chartEl"></canvas>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex items-center justify-center gap-10 text-[16px]">
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

type DayRow = { day: string; open: number; close: number }

// Sample hours to resemble the screenshot (stack to ~24h)
const rows = ref<DayRow[]>([
  { day: 'Monday',    open: 20, close: 4 },
  { day: 'Tuesday',   open: 16, close: 8 },
  { day: 'Wednesday', open: 15, close: 9 },
  { day: 'Thursday',  open: 20, close: 4 },
  { day: 'Friday',    open: 16, close: 8 },
  { day: 'Saturday',  open: 20, close: 4 },
  { day: 'Sunday',    open: 16, close: 8 },
])

const colors = {
  open:  '#f39c12', // orange
  close: '#e53935', // red
}

const labels    = computed(() => rows.value.map(r => r.day))
const openData  = computed(() => rows.value.map(r => r.open))
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
          stack: 'hours',
          barThickness: 38,
        },
        {
          label: 'Close',
          data: closeData.value,
          backgroundColor: colors.close,
          borderWidth: 0,
          borderRadius: 2,
          stack: 'hours',
          barThickness: 38,
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
            color: '#b28f63',
            font: { size: 11 },
            callback: (v: any) => `${v}h`,
          },
          border: { display: false },
          grid: {
            color: '#cbb896',       // dotted horizontal lines
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
  chart.data.labels = labels.value as any
  chart.data.datasets[0].data = openData.value as any
  chart.data.datasets[1].data = closeData.value as any
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())
</script>
