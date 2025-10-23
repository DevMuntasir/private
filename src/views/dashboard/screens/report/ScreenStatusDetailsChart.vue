<template>
  <div class="w-full bg-white p-5 rounded shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[18px] font-semibold font-primary text-[#4b4b4b]">Status Details ({{ granularityLabel }})</h3>
      <div v-if="props.granularity === 'hour'" class="flex items-center gap-2 text-xs">
        <span class="text-[#6b6b6b]">Show last</span>
        <button @click="selectedHours = 6"  :class="btnCls(selectedHours === 6)">6h</button>
        <button @click="selectedHours = 12" :class="btnCls(selectedHours === 12)">12h</button>
        <button @click="selectedHours = 24" :class="btnCls(selectedHours === 24)">24h</button>
      </div>
    </div>
    <div class="relative h-[300px]">
      <canvas ref="chartEl"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

type Row = { status: string; reported_at: string }

const props = defineProps<{
  rows: Row[]
  granularity: 'hour' | 'day'
}>()

const chartEl = ref<HTMLCanvasElement|null>(null)
let chart: Chart|null = null

// Use Tailwind theme colors: primary.500 and secondary.500
const colors = { online: '#D81F26', offline: 'oklch(0.769 0.188 70.08)' }

// Format 0-23 hour into 12h label like "12:00 AM", "1:00 PM"
function hourTo12Label(hour: number | string): string {
  const n = typeof hour === 'string' ? Number(hour) : hour
  if (!Number.isFinite(n)) return String(hour)
  const period = n < 12 ? 'AM' : 'PM'
  const h12 = n % 12 || 12
  return `${h12}:00 ${period}`
}

const normalized = computed(() => (Array.isArray(props.rows) ? props.rows : []).map(r => ({
  status: String(r.status || '').toLowerCase(),
  date: new Date(r.reported_at),
})).filter(r => !isNaN(r.date.getTime())))

// Selected hours window for hourly view (default 6)
const selectedHours = ref<6|12|24>(6)

// Helper to align a date to the start of the hour
function floorToHour(d: Date) {
  const x = new Date(d)
  x.setMinutes(0, 0, 0)
  return x
}

// Build hourly slots for the last N hours ending at the latest row time
const hourlyWindow = computed(() => {
  const H = selectedHours.value
  if (!normalized.value.length) return { labels: [], idxByTs: new Map<number, number>(), start: 0, end: 0 }
  const maxTs = Math.max(...normalized.value.map(r => r.date.getTime()))
  const endDate = floorToHour(new Date(maxTs))
  const end = endDate.getTime()
  const hourMs = 60*60*1000
  const start = end - (H - 1) * hourMs
  const labels: string[] = []
  const idxByTs = new Map<number, number>()
  let t = start
  let i = 0
  while (t <= end) {
    const d = new Date(t)
    labels.push(hourTo12Label(d.getHours()))
    idxByTs.set(t, i)
    t += hourMs
    i++
  }
  return { labels, idxByTs, start, end }
})

const buckets = computed(() => {
  if (props.granularity === 'hour') {
    const hourMs = 60*60*1000
    const { labels, start, end } = hourlyWindow.value
    const n = labels.length
    const online = Array(n).fill(0)
    const offline = Array(n).fill(0)
    for (const r of normalized.value) {
      const ts = floorToHour(r.date).getTime()
      if (ts < start || ts > end) continue
      const idx = Math.floor((ts - start) / hourMs)
      if (idx < 0 || idx >= n) continue
      if (r.status === 'online') online[idx] += 1
      else if (r.status === 'offline') offline[idx] += 1
    }
    return { labels, online, offline }
  }
  // granularity === 'day'
  // group by YYYY-MM-DD, sorted ascending
  const map = new Map<string, { online: number; offline: number }>()
  for (const r of normalized.value) {
    const key = r.date.toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, { online: 0, offline: 0 })
    const agg = map.get(key)!
    if (r.status === 'online') agg.online += 1
    else if (r.status === 'offline') agg.offline += 1
  }
  const labels = Array.from(map.keys()).sort()
  const online = labels.map(k => map.get(k)!.online)
  const offline = labels.map(k => map.get(k)!.offline)
  return { labels, online, offline }
})

const granularityLabel = computed(() => props.granularity === 'hour' ? 'Hourly' : 'Daily')

function buildConfig() {
  return {
    type: 'bar' as const,
    data: {
      labels: buckets.value.labels,
      datasets: [
        { label: 'Online', data: buckets.value.online, backgroundColor: colors.online, stack: 'status', borderWidth: 0, borderRadius: 2 },
        { label: 'Offline', data: buckets.value.offline, backgroundColor: colors.offline, stack: 'status', borderWidth: 0, borderRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: {
            callback: (val: any, idx: number) => {
              // When hourly, labels already formatted as 12h strings
              if (props.granularity === 'hour') return String(buckets.value.labels[idx] ?? val)
              // Daily: keep date label as-is
              return String(buckets.value.labels[idx] ?? val)
            },
          },
          title: {
            display: true,
            text: () => (props.granularity === 'hour' ? 'Time (12h)' : 'Date'),
          },
        },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  }
}

onMounted(() => {
  if (!chartEl.value) return
  chart = new Chart(chartEl.value, buildConfig())
})

watch(buckets, () => {
  if (!chart) return
  chart.data.labels = buckets.value.labels as any
  chart.data.datasets[0].data = buckets.value.online as any
  chart.data.datasets[1].data = buckets.value.offline as any
  // update x-axis title based on granularity
  const x = (chart.options.scales as any).x
  if (x && x.title) {
    x.title.display = true
    x.title.text = props.granularity === 'hour' ? 'Time (12h)' : 'Date'
  }
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())

function btnCls(active: boolean) {
  return [
    'px-2 py-1 rounded',
    active ? 'bg-[#4b4b4b] text-white' : 'bg-gray-200'
  ].join(' ')
}
</script>
