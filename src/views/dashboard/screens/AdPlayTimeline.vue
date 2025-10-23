<template>
  <div class="w-full">
    <div
      ref="viewport"
      class="relative overflow-x-auto overflow-y-hidden no-scrollbar w-full border bg-white rounded-md"
      @mouseenter="isPaused = true"
      @mouseleave="isPaused = false"
      style="height: 110px"
    >
      <!-- Live badge -->
      <div class="absolute left-2 top-2 z-10 flex items-center gap-2 text-xs font-semibold">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white">
          <span class="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
        <span class="text-gray-500">auto scrolling</span>
      </div>

      <!-- Items track -->
      <div
        ref="track"
        class="relative h-full flex items-stretch"
        :style="{ gap: gap + 'px', padding: '36px 12px 12px 12px' }"
      >
        <div
          v-for="(log, i) in logs"
          :key="keyOf(log, i)"
          class="shrink-0 h-[56px] rounded border bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col justify-center px-3"
          :style="{ width: itemWidth + 'px' }"
        >
          <div class="text-[11px] text-gray-500 leading-4">
            {{ formatTime(log) }}
          </div>
          <div class="text-sm font-semibold text-gray-800 leading-5 truncate">
            Ad #{{ log.ad_id }}
          </div>
          <div class="text-[11px] text-gray-500 truncate">{{ log.video }}</div>
        </div>
        <!-- End sentinel for cursor load -->
        <div ref="endSentinel" class="shrink-0 w-[1px] h-full" />
      </div>

      <!-- Right fade overlay -->
      <div class="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent" />
    </div>

    <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
      <div>
        Showing {{ logs.length }} plays • per page {{ perPage }}
      </div>
      <div class="flex items-center gap-3">
        <span v-if="loadingMore">Loading more…</span>
        <span v-if="!hasMore">End of history</span>
        <span class="hidden md:inline">Speed: {{ speedPxPerSec }} px/s</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed, nextTick } from 'vue'
import { adminScreenService } from '@/services/screen-service'
import type { ScreenVideoPlayLog, CursorScreenVideoPlayResponse } from '@/types/screen-type'

const props = defineProps<{
  screenId: number
  perPage?: number
  speedPxPerSec?: number
  itemWidth?: number
  gap?: number
}>()

const perPage = computed(() => props.perPage ?? 100)
const speedPxPerSec = computed(() => props.speedPxPerSec ?? 60)
const itemWidth = computed(() => props.itemWidth ?? 180)
const gap = computed(() => props.gap ?? 8)

const logs = ref<ScreenVideoPlayLog[]>([])
const nextCursor = ref<string | null>(null)
const hasMore = computed(() => !!nextCursor.value)
const loadingMore = ref(false)
const pollingTimer = ref<number | null>(null)

const viewport = ref<HTMLDivElement | null>(null)
const track = ref<HTMLDivElement | null>(null)
const endSentinel = ref<HTMLDivElement | null>(null)
let io: IntersectionObserver | null = null

// Smooth auto scroll loop
let rafId: number | null = null
let lastTs = 0

function loop(ts: number) {
  if (!viewport.value) {
    rafId = requestAnimationFrame(loop)
    return
  }
  if (!isPaused.value) {
    if (!lastTs) lastTs = ts
    const dt = (ts - lastTs) / 1000
    lastTs = ts
    const step = speedPxPerSec.value * dt
    viewport.value.scrollLeft = Math.min(
      viewport.value.scrollLeft + step,
      Math.max(0, viewport.value.scrollWidth - viewport.value.clientWidth)
    )

    // Safety trigger when close to end
    const nearEnd =
      viewport.value.scrollLeft + viewport.value.clientWidth >=
      viewport.value.scrollWidth - (itemWidth.value + gap.value) * 2
    if (nearEnd && hasMore.value && !loadingMore.value) {
      fetchMore()
    }
  }
  rafId = requestAnimationFrame(loop)
}

const isPaused = ref(false)

function keyOf(p: ScreenVideoPlayLog, i: number) {
  return `${p.ad_id}|${p.video}|${p.played_at_bd}|${i}`
}

function parseTS(s?: string) {
  if (!s) return NaN
  let t = Date.parse(s)
  if (!Number.isNaN(t)) return t
  const s2 = s.replace(' ', 'T').replace('+00', 'Z')
  t = Date.parse(s2)
  return Number.isNaN(t) ? NaN : t
}

function formatTime(p: ScreenVideoPlayLog) {
  // Show exactly what API sends for BD time without timezone shifting
  const raw = p.played_at_bd
  if (typeof raw === 'string' && raw.length >= 8) {
    // If full datetime like "YYYY-MM-DD HH:mm:ss", extract HH:mm:ss; else return raw
    const hasDate = /\d{4}-\d{2}-\d{2}[ T]/.test(raw)
    return hasDate ? raw.slice(-8) : raw
  }
  // Fallback: parse and format without forcing a timezone
  const d = new Date(parseTS(String(raw)))
  if (isNaN(d.getTime())) return String(raw ?? '')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

async function fetchInitial() {
  logs.value = []
  nextCursor.value = null
  const res = await adminScreenService.getScreenVideoPlayDataCursor(props.screenId, { per_page: perPage.value })
  const payload = res.data as unknown as CursorScreenVideoPlayResponse
  logs.value = payload.data ?? []
  nextCursor.value = payload.next_cursor ?? null
  await nextTick()
  // Start at current time (latest at left)
  if (viewport.value) viewport.value.scrollLeft = 0
}

async function fetchMore() {
  if (!nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const res = await adminScreenService.getScreenVideoPlayDataCursor(props.screenId, {
      cursor: nextCursor.value,
      per_page: perPage.value,
    })
    const payload = res.data as unknown as CursorScreenVideoPlayResponse
    const incoming = payload.data ?? []
    if (incoming.length) logs.value = [...logs.value, ...incoming]
    nextCursor.value = payload.next_cursor ?? null
  } finally {
    loadingMore.value = false
  }
}

// Poll head for new items and prepend without visual jump
async function refreshHead() {
  try {
    const res = await adminScreenService.getScreenVideoPlayDataCursor(props.screenId, { per_page: perPage.value })
    const payload = res.data as unknown as CursorScreenVideoPlayResponse
    const head = payload.data ?? []
    if (!head.length) return
    const seen = new Set(logs.value.map((p) => `${p.ad_id}|${p.video}|${p.played_at_bd}`))
    const toPrepend: ScreenVideoPlayLog[] = []
    for (const p of head) {
      const k = `${p.ad_id}|${p.video}|${p.played_at_bd}`
      if (!seen.has(k)) toPrepend.push(p)
      else break // stop at first known to keep order
    }
    if (toPrepend.length) {
      const adjust = toPrepend.length * (itemWidth.value + gap.value)
      if (viewport.value) viewport.value.scrollLeft += adjust
      logs.value = [...toPrepend, ...logs.value]
    }
  } catch (e) {
    // soft fail
  }
}

function setupIO() {
  if (!viewport.value || !endSentinel.value) return
  io?.disconnect()
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && hasMore.value && !loadingMore.value) {
          fetchMore()
        }
      }
    },
    { root: viewport.value, threshold: 0.1 }
  )
  io.observe(endSentinel.value)
}

onMounted(async () => {
  await fetchInitial()
  setupIO()
  rafId = requestAnimationFrame(loop)
  // head poll 5s
  pollingTimer.value = window.setInterval(refreshHead, 5000)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  io?.disconnect()
  if (pollingTimer.value) window.clearInterval(pollingTimer.value)
})

watch(() => props.screenId, async () => {
  await fetchInitial()
  setupIO()
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>


