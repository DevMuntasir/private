<template>
  <div class="flex flex-col w-full overflow-hidden" :style="rootStyle">
    <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b bg-white">
      <div class="flex items-center gap-2">
        <button type="button" class="px-3 py-1.5 rounded border" @click="$emit('request-older')">Load older</button>
        <button type="button" class="px-3 py-1.5 rounded bg-blue-600 text-white" @click="$emit('refresh')">Refresh</button>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <label class="flex items-center gap-2">
          <span>From</span>
          <input type="datetime-local" step="1" class="px-2 py-1 border rounded" v-model="fromInput" />
        </label>
        <label class="flex items-center gap-2">
          <span>To</span>
          <input type="datetime-local" step="1" class="px-2 py-1 border rounded" v-model="toInput" />
        </label>
        <button type="button" class="px-3 py-1.5 rounded border" @click="applyRange">Apply</button>
        <button type="button" class="px-3 py-1.5 rounded border" @click="clearRange">Clear</button>
      </div>
    </div>

    <div class="flex-1 min-h-0">
      <Timeline
        ref="mainChartRef"
        class="h-full w-full"
        :groups="groups"
        :items="timelineItems"
        :initial-viewport-start="viewportStart"
        :initial-viewport-end="viewportEnd"
        @changeViewport="onMainViewportChange"
      >
        <template #item="{ item }">
          <div :title="item.title || null" :style="itemStyle(item)" />
        </template>
      </Timeline>
    </div>

    <div class="border-t bg-white/60">
      <Timeline
        ref="overviewChartRef"
        class="h-28 w-full"
        :groups="groups"
        :items="timelineItems"
        :initial-viewport-start="viewportStart"
        :initial-viewport-end="viewportEnd"
        @changeViewport="onOverviewViewportChange"
      >
        <template #item="{ item }">
          <div :style="itemStyleMini(item)" />
        </template>
      </Timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, nextTick, onMounted, ref, watch } from 'vue'
import { Timeline } from 'vue-timeline-chart'
import 'vue-timeline-chart/style.css'

type Bucket = '1s' | '5s' | '10s' | '1m'
interface EventItem { screen_id: number; video: string; ad_id: number; played_at_bd: string; created_at: string; updated_at: string }
interface PageMeta { next_cursor: string | null; next_page_url: string | null; prev_cursor: string | null; prev_page_url: string | null }
interface Filters { from?: Date; to?: Date; bucket?: Bucket }

const props = defineProps<{ eventsAsc: EventItem[]; page: PageMeta; filters?: Filters; heightPx?: number }>()
const emit = defineEmits<{ (e: 'request-older'): void; (e: 'refresh'): void; (e: 'update-range', v: { from?: Date; to?: Date }): void }>()

const rootStyle = computed(() => ({ height: `${Number(props.heightPx ?? 520)}px` }))

function toDhakaDate(s: string): Date {
  const [d, t] = s.split(' ')
  const [y, m, day] = d.split('-').map(Number)
  const [hh, mm, ss] = t.split(':').map(Number)
  return new Date(y, m - 1, day, hh, mm, ss)
}

const filtered = computed(() => {
  const from = props.filters?.from?.getTime() ?? -Infinity
  const to = props.filters?.to?.getTime() ?? Infinity
  return (props.eventsAsc || []).filter(e => {
    const ts = toDhakaDate(e.played_at_bd).getTime()
    return ts >= from && ts <= to
  })
})

const groups = computed(() => Array.from(new Set(filtered.value.map(e => String(e.ad_id)))).map(id => ({ id, label: `Ad ${id}` })))
type RangeItem = { type: 'range'; start: number; end: number; id: string; group: string; title?: string }
const timelineItems = computed<RangeItem[]>(() => filtered.value.map(e => {
  const start = toDhakaDate(e.played_at_bd).getTime()
  const end = start + 1000 // show 1s wide blocks for visibility
  return {
    type: 'range',
    start,
    end,
    id: `${e.ad_id}-${e.screen_id}-${e.video}-${e.played_at_bd}`,
    group: String(e.ad_id),
    title: `Ad ${e.ad_id} • Screen ${e.screen_id}\n${e.video}\n${e.played_at_bd}`,
  }
}))

const mainChartRef = ref<any | null>(null)
const overviewChartRef = ref<any | null>(null)
const viewportStart = ref<number | undefined>(undefined)
const viewportEnd = ref<number | undefined>(undefined)

// Visuals
const palette = ['#2563eb','#16a34a','#e11d48','#9333ea','#f59e0b','#0ea5e9','#059669','#ef4444','#7c3aed','#22c55e']
function colorFor(groupId: string) {
  const idx = Math.abs(parseInt(groupId, 10)) % palette.length
  return palette[idx]
}
function itemStyle(item: any) {
  return { position: 'absolute', inset: 0, backgroundColor: colorFor(String(item.group)), opacity: 0.9, borderRadius: '3px' }
}
function itemStyleMini(item: any) {
  return { position: 'absolute', inset: 0, backgroundColor: colorFor(String(item.group)), opacity: 0.5, borderRadius: '2px' }
}

function setBothViewports(start?: number, end?: number) {
  viewportStart.value = start
  viewportEnd.value = end
  const a: any = mainChartRef.value
  const b: any = overviewChartRef.value
  if (a?.setViewport) a.setViewport(start, end)
  if (b?.setViewport) b.setViewport(start, end)
}
function onMainViewportChange(p: { start: number; end: number }) { setBothViewports(p.start, p.end) }
function onOverviewViewportChange(p: { start: number; end: number }) { setBothViewports(p.start, p.end) }

// Date filter controls
const fromInput = ref<string>('')
const toInput = ref<string>('')
watch(() => props.filters, () => {
  if (props.filters?.from) fromInput.value = toLocalInput(props.filters.from); else fromInput.value = ''
  if (props.filters?.to) toInput.value = toLocalInput(props.filters.to); else toInput.value = ''
}, { immediate: true })
function toLocalInput(d: Date) { const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` }
function parseLocalInput(s: string) { const d = new Date(s); return isNaN(d.getTime()) ? undefined : d }
function applyRange() { emit('update-range', { from: parseLocalInput(fromInput.value), to: parseLocalInput(toInput.value) }) }
function clearRange() { fromInput.value = ''; toInput.value = ''; emit('update-range', { from: undefined, to: undefined }) }

onMounted(async () => {
  await nextTick()
  const times = timelineItems.value.map(i => i.start)
  if (!times.length) return
  const max = times[times.length - 1]
  const fiveMin = 5 * 60 * 1000
  const min = Math.max(times[0], max - fiveMin)
  setBothViewports(min, max)
})
</script>
