<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
    <div class="bg-white w-full max-w-4xl rounded-md shadow-xl max-h-[90vh] overflow-auto">
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <h3 class="text-sm font-medium text-gray-900">Crop Cover Image</h3>
        <button type="button" class="text-gray-500 hover:text-gray-700" @click="$emit('close')">✕</button>
      </div>
      <div class="p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Crop Area -->
          <div class="flex-1 flex items-center justify-center">
            <div
              ref="cropBox"
              class="relative bg-black/5 overflow-hidden border border-gray-300"
              :style="{ width: cropW + 'px', height: cropH + 'px', maxWidth: '100%' }"
              @mousedown="onPointerDown"
              @mousemove="onPointerMove"
              @mouseup="onPointerUp"
              @mouseleave="onPointerUp"
              @touchstart.prevent="onPointerDown"
              @touchmove.prevent="onPointerMove"
              @touchend.prevent="onPointerUp"
              @wheel.prevent="onWheel"
            >
              <img
                v-if="imgSrc"
                ref="imgEl"
                :src="imgSrc"
                alt="to crop"
                class="select-none"
                :style="{
                  position: 'absolute',
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  width: imgNW + 'px',
                  height: imgNH + 'px',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  willChange: 'transform'
                }"
                draggable="false"
              />
            </div>
          </div>

          <!-- Controls -->
          <div class="w-full md:w-64">
            <div class="text-xs text-gray-600 mb-2">Zoom</div>
            <input type="range" :min="minScale" :max="maxScale" step="0.01" v-model.number="scale" @input="onScaleInput" class="w-full" />
            <div class="text-[11px] text-gray-500 mt-1">{{ scale.toFixed(2) }}x</div>
            <div class="mt-4 text-[11px] text-gray-500">Aspect: {{ aspect.toFixed(2) }} | Output: {{ outW }}x{{ outH }}</div>
          </div>
        </div>
      </div>
      <div class="px-4 py-3 border-t flex justify-end gap-2">
        <button type="button" class="px-4 py-2 text-sm" @click="$emit('close')">Cancel</button>
        <button type="button" class="px-4 py-2 bg-secondary text-white text-sm rounded" @click="confirm">Use Image</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  src: string | null
  aspect: number // width / height
  outputWidth?: number // default 1500
  mime?: string // default image/jpeg
  quality?: number // default 0.9
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'confirm', file: File): void }>()

const cropBox = ref<HTMLDivElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)
const imgSrc = ref<string | null>(null)
const imgNW = ref(0) // natural width
const imgNH = ref(0) // natural height

// crop viewport size (responsive to viewport)
const winW = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1280)
const winH = ref<number>(typeof window !== 'undefined' ? window.innerHeight : 800)

const cropW = computed(() => {
  const maxW = 600
  const availableW = Math.max(240, winW.value - 320) // leave space for controls and paddings
  const maxCropH = Math.max(220, Math.floor(winH.value * 0.6))
  const byHeight = Math.floor(maxCropH * (props.aspect || 1))
  return Math.floor(Math.max(220, Math.min(maxW, availableW, byHeight)))
})
const cropH = computed(() => Math.round(cropW.value / props.aspect))

// pan + zoom
const scale = ref(1)
const minScale = ref(1)
const maxScale = ref(4)
const offsetX = ref(0)
const offsetY = ref(0)

const dragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)

const outW = computed(() => props.outputWidth ?? 1500)
const outH = computed(() => Math.round(outW.value / props.aspect))

watch(() => props.src, async (val) => {
  if (!val) return
  imgSrc.value = val
  await nextTick()
  await loadImage()
}, { immediate: true })

watch(() => props.aspect, async () => {
  if (imgNW.value && imgNH.value) initView()
})

function onResize() {
  winW.value = window.innerWidth
  winH.value = window.innerHeight
  if (imgNW.value && imgNH.value) initView()
}

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})


async function loadImage() {
  const img = new Image()
  img.src = props.src || ''
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
  imgNW.value = img.naturalWidth
  imgNH.value = img.naturalHeight
  initView()
}

function initView() {
  // fit image to cover crop box
  const cw = cropW.value
  const ch = cropH.value
  const s0 = Math.max(cw / imgNW.value, ch / imgNH.value)
  minScale.value = s0
  scale.value = s0
  maxScale.value = s0 * 4
  // center the image
  const w = imgNW.value * scale.value
  const h = imgNH.value * scale.value
  offsetX.value = Math.floor((cw - w) / 2)
  offsetY.value = Math.floor((ch - h) / 2)
}

function clampOffsets() {
  const cw = cropW.value
  const ch = cropH.value
  const w = imgNW.value * scale.value
  const h = imgNH.value * scale.value
  const minX = Math.min(0, cw - w)
  const minY = Math.min(0, ch - h)
  const maxX = 0
  const maxY = 0
  offsetX.value = Math.max(minX, Math.min(maxX, offsetX.value))
  offsetY.value = Math.max(minY, Math.min(maxY, offsetY.value))
}

function onPointerDown(e: MouseEvent | TouchEvent) {
  dragging.value = true
  const p = 'touches' in e ? e.touches[0] : e
  lastX.value = p.clientX
  lastY.value = p.clientY
}
function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return
  const p = 'touches' in e ? e.touches[0] : e
  const dx = p.clientX - lastX.value
  const dy = p.clientY - lastY.value
  offsetX.value += dx
  offsetY.value += dy
  lastX.value = p.clientX
  lastY.value = p.clientY
  clampOffsets()
}
function onPointerUp() { dragging.value = false }
function setScaleAnchored(newScale: number, anchorX: number, anchorY: number, oldScale?: number) {
  const prev = oldScale ?? scale.value
  const s = Math.min(maxScale.value, Math.max(minScale.value, newScale))
  const imgAX = (anchorX - offsetX.value) / prev
  const imgAY = (anchorY - offsetY.value) / prev
  scale.value = s
  offsetX.value = Math.round(anchorX - imgAX * s)
  offsetY.value = Math.round(anchorY - imgAY * s)
  clampOffsets()
}

function onScaleInput() {
  const cw = cropW.value
  const ch = cropH.value
  setScaleAnchored(scale.value, cw / 2, ch / 2)
}

function onWheel(e: WheelEvent) {
  if (!imgNW.value || !imgNH.value) return
  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const factor = 1 - Math.sign(e.deltaY) * 0.1
  const next = scale.value * factor
  setScaleAnchored(next, x, y)
}


async function confirm() {
  if (!imgSrc.value) return
  // compute source rectangle in original image space
  const cw = cropW.value
  const ch = cropH.value
  const srcX = Math.max(0, Math.min(imgNW.value - cw / scale.value, -offsetX.value / scale.value))
  const srcY = Math.max(0, Math.min(imgNH.value - ch / scale.value, -offsetY.value / scale.value))
  const srcW = Math.min(imgNW.value - srcX, cw / scale.value)
  const srcH = Math.min(imgNH.value - srcY, ch / scale.value)

  const canvas = document.createElement('canvas')
  canvas.width = outW.value
  canvas.height = outH.value
  const ctx = canvas.getContext('2d')!

  const img = new Image()
  img.src = imgSrc.value
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW.value, outH.value)

  const mime = props.mime ?? 'image/jpeg'
  const quality = props.quality ?? 0.9
  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), mime, quality))
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  const file = new File([blob], `cover_image.${ext}`, { type: mime })
  emit('confirm', file)
}
</script>

<style scoped>
/* optional styles */
</style>



