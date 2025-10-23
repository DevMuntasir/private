<template>
  <div class="w-1/2 bg-[#decbaa] p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[18px] font-semibold font-primary">Daily Gender by Age Group</h3>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-3 text-sm">
      <div class="flex items-center gap-2">
        <button @click="setQuick('day')" :class="btnCls(quickRange==='day')">Day</button>
        <button @click="setQuick('week')" :class="btnCls(quickRange==='week')">Week</button>
        <button @click="setQuick('month')" :class="btnCls(quickRange==='month')">Month</button>
      </div>
      
    </div>

    <!-- Chart -->
    <div class="relative h-[300px]">
      <canvas ref="chartEl"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'
import { AdConstant } from '@/constant/ads'

type GenderKey = 'male' | 'female'

interface Row { date: string; age_group: string | number; gender: string; impressions: number }
interface ImpressionsMap { male?: number; female?: number; other?: number }

const props = defineProps<{
  // Preferred: per-day, per-age-group rows
  rows?: Row[] | null
  // Optional: preserve backward compatibility
  impressions?: ImpressionsMap | null
  // Optional: control order of age groups
  ageGroups?: Array<string | number>
}>()

// Colors from Tailwind theme (primary.500 / secondary.500)
const colors = { male: '#E6B71D', female: '#8f8f8f' }

// Default age buckets requested
const defaultAgeGroups = ['18-32', '33-50', '51-64'] as const
type AgeBucket = typeof defaultAgeGroups[number]

function bucketAgeGroup(input: string | number | undefined): AgeBucket {
  // Numeric ages or strings like '25', '25-34', '55+', '18–24'
  const s = String(input ?? '').trim()
  const nums = (s.match(/\d+/g) || []).map((n) => parseInt(n, 10)).filter((n) => Number.isFinite(n))
  let ageRef: number | null = null
  if (typeof input === 'number' && Number.isFinite(input)) ageRef = input
  else if (nums.length >= 1) ageRef = nums[0]

  if (ageRef === null) {
    // Fallback: unknown => first bucket
    return '18-32'
  }
  if (ageRef <= 32) return '18-32'
  if (ageRef <= 50) return '33-50'
  return '51-64'
}

const fallbackRows = computed<Row[]>(() => {
  if (!props.impressions) return []
  const m = Number(props.impressions.male ?? 0) || 0
  const f = Number(props.impressions.female ?? 0) || 0
  const day = new Date().toISOString().slice(0, 10)
  return [
    { date: day, age_group: 'All', gender: 'male', impressions: m },
    { date: day, age_group: 'All', gender: 'female', impressions: f },
  ]
})

// Normalize rows
const normalized = computed<Row[]>(() => {
  const base = Array.isArray(props.rows) && props.rows.length ? props.rows : fallbackRows.value
  return base
    .filter((r) => r && r.date && r.gender)
    .map((r) => {
      const ageBucket = bucketAgeGroup(r.age_group as any)
      return {
        date: String(r.date).slice(0, 10),
        age_group: ageBucket,
        gender: String(r.gender).toLowerCase(),
        impressions: Number(r.impressions) || 0,
      }
    })
})

// ===== time range filter =====
const pad2 = (n: number) => String(n).padStart(2, '0')
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
const parseLocalInput = (s: string | null) => {
  if (!s) return NaN
  const t = new Date(s).getTime()
  return isNaN(t) ? NaN : t
}

const fullMinTs = computed(() => {
  const ts = normalized.value.map(r => new Date(r.date).getTime()).filter(v => !isNaN(v))
  return ts.length ? Math.min(...ts) : Date.now()
})
const fullMaxTs = computed(() => {
  const ts = normalized.value.map(r => new Date(r.date).getTime()).filter(v => !isNaN(v))
  return ts.length ? Math.max(...ts) : Date.now()
})

const quickRange = ref<'day' | 'week' | 'month'>('day')
const rangeStartMs = ref<number | null>(null)
const rangeEndMs = ref<number | null>(null)

watch([fullMinTs, fullMaxTs], ([a, b]) => {
  // initialize range to current quick selection
  setQuick(quickRange.value)
}, { immediate: true })

function setQuick(mode: 'day'|'week'|'month') {
  quickRange.value = mode
  const ONE_DAY = 24*60*60*1000
  const endBase = fullMaxTs.value // midnight of last day in data
  let start = fullMinTs.value
  let end = endBase + (ONE_DAY - 1) // include the last day fully
  if (mode === 'day') {
    start = endBase
  } else if (mode === 'week') {
    start = endBase - 7*ONE_DAY + 1
  } else if (mode === 'month') {
    start = endBase - 30*ONE_DAY + 1
  }
  rangeStartMs.value = start
  rangeEndMs.value = end
}

const filtered = computed(() => {
  const a = rangeStartMs.value
  const b = rangeEndMs.value
  if (a == null || b == null) return normalized.value
  return normalized.value.filter(r => {
    const t = new Date(r.date).getTime()
    return !isNaN(t) && t >= a && t <= b
  })
})

const days = computed(() => Array.from(new Set(normalized.value.map((r) => r.date))).sort())

const ageGroupOrder = computed(() => {
  if (Array.isArray(props.ageGroups) && props.ageGroups.length) return props.ageGroups
  return [...defaultAgeGroups]
})

// Aggregate across days for each age bucket -> three bars per age bucket:
// Total (age group), Male, Female
const sumsByAge = computed(() => {
  const sums = new Map<string | number, { total: number; male: number; female: number }>()
  for (const age of ageGroupOrder.value) sums.set(age, { total: 0, male: 0, female: 0 })
  for (const r of filtered.value) {
    const g: GenderKey = (r.gender === AdConstant.AUDIENCE_TARGET_FEMALE || r.gender === 'female') ? 'female' : 'male'
    const entry = sums.get(r.age_group) || { total: 0, male: 0, female: 0 }
    entry[g] += r.impressions
    entry.total += r.impressions
    sums.set(r.age_group, entry)
  }
  return sums
})

const labels = computed(() => ageGroupOrder.value.map(String))

const datasets = computed(() => {
  const male = labels.value.map((age) => sumsByAge.value.get(age)?.male ?? 0)
  const female = labels.value.map((age) => sumsByAge.value.get(age)?.female ?? 0)
  const total = labels.value.map((age) => sumsByAge.value.get(age)?.total ?? 0)
  return [
    {
      type: 'bar' as const,
      label: 'Age group total',
      data: total,
      backgroundColor: '#DA0000', // neutral gray for totals
      borderWidth: 0,
      borderRadius: 2,
      barThickness: 18,
    },
    {
      type: 'bar' as const,
      label: 'Male',
      data: male,
      backgroundColor: colors.male,
      borderWidth: 0,
      borderRadius: 2,
      barThickness: 18,
    },
    {
      type: 'bar' as const,
      label: 'Female',
      data: female,
      backgroundColor: colors.female,
      borderWidth: 0,
      borderRadius: 2,
      barThickness: 18,
    },
  ]
})

const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function buildConfig() {
  return {
    type: 'bar' as const,
    data: {
      labels: labels.value,
      datasets: datasets.value,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { enabled: true },
      },
      scales: {
        x: { stacked: false, grid: { display: false }, title: { display: true, text: 'Age Group' } },
        y: { stacked: false, beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Impressions' } },
      },
    },
  }
}

onMounted(() => {
  if (!chartEl.value) return
  chart = new Chart(chartEl.value, buildConfig())
})

watch([datasets, labels], () => {
  if (!chart) return
  chart.data.labels = labels.value as any
  chart.data.datasets = datasets.value as any
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())

// style helper
function btnCls(active: boolean) {
  return [ 'px-2 py-1 text-xs rounded', active ? 'bg-[#4b4b4b] text-white' : 'bg-gray-200' ].join(' ')
}
</script>
