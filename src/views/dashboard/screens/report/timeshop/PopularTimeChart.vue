<!-- PopularTimesCard.vue -->
<template>
  <div class="w-full bg-[#decbaa]  p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <span class="text-[#c17b1e] font-semibold font-primary">Popular Times</span>

        <!-- Live pill (only when selected day is 'Wednesday' in demo; bind to isLive if you want realtime) -->
        <span
          v-if="isLive"
          class="px-2 py-[2px] rounded-full text-white text-xs font-semibold bg-[#ff5a1f]"
        >
          Live
        </span>
      </div>

      <div class="flex items-center gap-2">
        <select v-model="dayIdx" class="bg-white/80 rounded border px-2 py-1 text-sm">
          <option v-for="(d, i) in days" :key="d" :value="i">{{ d }}</option>
        </select>
      </div>
    </div>

    <!-- Chart area -->
    <div class="relative">
      <!-- dotted horizontal guides -->
      <div class="absolute inset-0 pointer-events-none pt-6">
        <div class="h-full flex flex-col justify-between opacity-60">
          <div v-for="n in 7" :key="n" class="border-t border-dotted border-[#cbb896]"></div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Left arrow -->
        <button
          class="shrink-0 w-7 h-7 grid place-items-center text-[#333]"
          @click="prevDay"
          aria-label="Previous day"
        >
          ‹
        </button>

        <!-- Chart -->
        <div class="relative grow h-[220px]">
          <canvas ref="chartEl"></canvas>
        </div>

        <!-- Right arrow -->
        <button
          class="shrink-0 w-7 h-7 grid place-items-center text-[#333]"
          @click="nextDay"
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      <!-- X ticks like 6a 9a 12p ... -->
      <div class="mt-2 flex justify-between text-[12px] text-[#6b6b6b] px-8">
        <span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span><span>9p</span><span>12a</span><span>3a</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

// --- Demo data (0..23 hours) for each day; values 0..100 for relative busyness
// 6am..3am will be visible; others also plotted but smaller.
const template = (peak1 = 20, peak2 = 85) => ([
  10, 10, 8, 8, 8, 10,   // 12a-5a
  12, 14, 28, 18, 18, 22, // 6a-11a
  35, 18, 12, 10, 12, 40, // 12p-5p
  55, 70, 78, 68, 50, 20  // 6p-11p
].map((v, i) => i === 13 ? peak1 : (i >= 18 && i <= 20 ? peak2 : v))) // small noon bump + evening peak

const dataByDay: number[][] = [
  template(18, 70), // Sun
  template(16, 75), // Mon
  template(22, 85), // Tue
  template(28, 82), // Wed (will show Live on 1pm for the demo)
  template(20, 80), // Thu
  template(24, 88), // Fri
  template(26, 90), // Sat
]

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const dayIdx = ref(3) // default Wednesday as in screenshot
const hours = Array.from({ length: 24 }, (_, h) => h) // 0..23

// Live hour (for the orange highlighted bar). 13 => 1pm
const liveHour = ref(13)
const isLive = computed(() => days[dayIdx.value] === 'Wednesday') // demo condition; change as needed

// Chart refs
const chartEl = ref<HTMLCanvasElement|null>(null)
let chart: Chart | null = null

const datasetVals = computed(() => dataByDay[dayIdx.value])

function makeConfig() {
  return {
    type: 'bar' as const,
    data: {
      labels: hours.map(h => `${h}`),
      datasets: [{
        data: datasetVals.value,
        borderWidth: 0,
        backgroundColor: (ctx: any) => {
          const i = ctx.dataIndex
          // Default charcoal bars
          let color = '#4b4b4b'
          // Live hour gradient (dark -> orange)
          if (isLive.value && i === liveHour.value) {
            const { ctx: c } = ctx.chart
            const g = c.createLinearGradient(0, 0, 0, ctx.chart.chartArea?.bottom || 200)
            g.addColorStop(0, '#ff6a00')
            g.addColorStop(0.45, '#ff6a00')
            g.addColorStop(0.46, '#7a2d14') // a thin darker slice at the bottom
            g.addColorStop(1, '#3a2a23')
            return g
          }
          return color
        },
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      }],
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
          grid: { display: false },
          ticks: { display: false }, // custom ticks shown below manually
          border: { display: false },
        },
        y: {
          min: 0,
          suggestedMax: 100,
          ticks: { display: false },
          border: { display: false },
          grid: {
            color: '#cbb896',
            borderDash: [2, 4],
            drawTicks: false,
          },
        },
      },
    },
  }
}

function prevDay(){ dayIdx.value = (dayIdx.value + days.length - 1) % days.length }
function nextDay(){ dayIdx.value = (dayIdx.value + 1) % days.length }

onMounted(() => {
  if (!chartEl.value) return
  chart = new Chart(chartEl.value, makeConfig())
})

watch([datasetVals, dayIdx], () => {
  if (!chart) return
  // update dataset
  chart.data.datasets[0].data = datasetVals.value as any
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())
</script>
