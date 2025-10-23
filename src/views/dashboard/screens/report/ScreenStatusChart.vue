<template>
  <div class="w-1/2 bg-[#decbaa] p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[18px] font-semibold font-primary">Screens Status</h3>
    </div>

    <!-- Chart with centered total -->
    <div class="relative h-[260px]">
      <canvas ref="chartEl"></canvas>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-center">
          <div class="text-[11px] uppercase tracking-wide text-[#6b6b6b]">Total</div>
          <div class="text-[22px] font-semibold text-[#4b4b4b]">{{ total.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-5 flex items-center gap-8 text-[16px]">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.online }"></span>
        <span class="text-[#4b4b4b]">Online</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.offline }"></span>
        <span class="text-[#4b4b4b]">Offline</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'



const props = defineProps<{
  // Direct counts
  counts?: { online?: number; offline?: number } | null
  // Or rows of screens with status we can aggregate
  rows?: Array<{ status: string }> | null
}>()

const colors = {
  online: '#E6B71D',  // emerald
  offline: '#DA0000', // red
}

const totals = computed(() => {
  if (props.counts) {
    return {
      online: Number(props.counts.online ?? 0) || 0,
      offline: Number(props.counts.offline ?? 0) || 0,
    }
  }
  const rows = Array.isArray(props.rows) ? props.rows : []
  return rows.reduce(
    (acc, r) => {
      const s = String(r.status || '').toLowerCase()
      if (s === 'online') acc.online += 1
      else if (s === 'offline') acc.offline += 1
      return acc
    },
    { online: 0, offline: 0 }
  )
})

const labels = ['Online', 'Offline']
const values = computed(() => [totals.value.online, totals.value.offline])
const total = computed(() => values.value.reduce((a, b) => a + b, 0))

const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function buildConfig() {
  return {
    type: 'doughnut' as const,
    data: {
      labels,
      datasets: [
        {
          data: values.value,
          backgroundColor: [colors.online, colors.offline],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const label = ctx.label || ''
              const v = ctx.parsed || 0
              return `${label}: ${v}`
            },
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

watch(values, () => {
  if (!chart) return
  chart.data.datasets[0].data = values.value
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())
</script>

