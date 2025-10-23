<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4 shadow-2xl border-2"
  >
    <div class="relative w-full h-full">
      <!-- Draggable & Zoomable Container -->
      <div
        class="absolute cursor-move flex flex-col items-center"
        :style="{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
          transformOrigin: 'top left',
        }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <!-- TV Box -->
        <div
          class="bg-black px-3 pb-4 pt-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] rounded-lg border-4 border-gray-800"
        >
          <div class="bg-black p-3 rounded">
            <div
              class="relative bg-black rounded overflow-hidden aspect-[9/16] max-w-[250px]"
              
            >
              <video
                :src="props.videoUrl"
                class="w-full h-full object-contain"
                autoplay
                loop
                muted
                playsinline
                controls
              />
              <div
                class="absolute inset-0 border-2 border-gray-700 rounded pointer-events-none"
              />
            </div>
          </div>
          <img
          
            src="/logo/white-logo.svg"
            class="w-[150px] mx-auto mt-2"
            alt="Logo"
          />
        </div>

        <!-- Controls BELOW the TV Box -->
        <div class="mt-4 flex items-center justify-center gap-8 w-full px-2">
          <!-- Zoom Buttons -->
          <div class="flex gap-2">
            <button
              @click.stop="zoomOut"
              class="text-white bg-secondary px-4 rounded hover:bg-gray-600 text-[18px]"
              :disabled="zoomLevel <= 0.5"
            >
              -
            </button>

            <button
              @click.stop="zoomIn"
              class="text-white bg-secondary px-4 rounded hover:bg-gray-600 text-[18px]"
              :disabled="zoomLevel >= 3"
            >
              +
            </button>
          </div>

          <!-- Zoom Level Display -->
          <!-- <div
            class="text-gray-400 text-sm bg-white bg-opacity-10 px-2 py-1 rounded"
          >
            Zoom: {{ Math.round(zoomLevel * 100) }}%
          </div> -->

          <!-- Close Button -->
          <button
            @click.stop="emit('close')"
            class="text-gray-100 absolute -top-4 -right-4 text-md w-9 h-9 hover:text-red-500 bg-black/80 p-1 rounded-full"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  isOpen: boolean
  videoUrl: string
  width?: number
  height?: number
  logoUrl?: string
}>()

const emit = defineEmits(['close'])

const zoomLevel = ref(1.2)

function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3)
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5)
}



watch(() => props.isOpen, (val) => {
  if (val) zoomLevel.value = 1
})

// Dragging logic
const position = ref({ x: 100, y: 100 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y,
  }
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  position.value = {
    x: clientX - dragOffset.value.x,
    y: clientY - dragOffset.value.y,
  }
}

function stopDrag() {
  isDragging.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
})
</script>
