<template>
  <div class="space-y-3">
    <!-- Controls -->
    <button
      v-if="imageFile"
      type="button"
      class="px-3 py-1.5 text-xs border rounded hover:bg-muted bg-white"
      @click.stop="clearImage"
    >
      Remove
    </button>

    <!-- Hidden file input -->
    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImageChosen" />

    <!-- Placeholder when no image selected -->
    <div
      v-if="!imagePreviewUrl"
      class="dropzone w-[220px] h-[220px] p-6 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors"
      :class="isImageDragOver ? 'border-secondary bg-secondary/5' : 'border-gray-300 bg-white'"
      @click.stop="triggerImagePick"
      @dragover.prevent
      @dragenter.prevent="handleImageDragEnter"
      @dragleave.prevent="handleImageDragLeave"
      @drop.prevent="onImageDrop"
    >
      <div class="flex flex-col items-center text-center gap-2">
        <div
          class="w-10 h-10 rounded-full border border-secondary/40 flex items-center justify-center text-secondary"
        >
          <ImageIcon class="w-5 h-5" />
        </div>
        <div class="text-secondary font-medium">{{ imageFile ? 'Change Poster' : 'Add Poster' }}</div>
        <p class="text-[12px] text-gray-500">Drag and drop your image or click to browse</p>
        <p class="text-[12px] text-gray-400">
          <template v-if="templateId === 2">Expected 1067 A- 1304 (9:11)</template>
          <template v-else-if="templateId === 3">Expected 906 A- 302 (3:1)</template>
        </p>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="imagePreviewUrl" class="border max-w-[220px] rounded-md p-3 bg-white">
      <div class="flex items-start gap-3">
        <img
          :src="imagePreviewUrl"
          :alt="'Selected poster image'"
          class="rounded-md w-full max-h-[320px] object-contain border"
        />
      </div>
    </div>

    <!-- Cropper modal (replaces custom CropperModal) -->
    <transition name="fade">
      <div v-if="isCropOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="closeCropper" />

        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 p-4 md:p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">Crop Poster</h3>
              <p class="text-xs text-gray-500">
                Aspect {{ cropAspect.toFixed(2) }} • Output width {{ cropOutputWidth }}px (JPEG, 90% quality)
              </p>
            </div>
            <button
              class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
              @click="closeCropper"
              type="button"
            >
              Cancel
            </button>
          </div>

          <div class="relative border rounded-md overflow-hidden bg-gray-50">
            <Cropper
              ref="cropperRef"
              class="h-[55vh] w-full"
              :src="cropSrc"
              :stencil-props="{ aspectRatio: cropAspect }"
              :canvas="{ 
                fillColor: '#ffffff',
              }"
              :image-restriction="'stencil'"
            />
          </div>

          <div class="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
              @click="resetCrop"
            >
              Reset
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs border rounded bg-secondary text-white hover:opacity-90"
              @click="confirmCrop"
            >
              Use Image
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Image as ImageIcon } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  templateId: { type: Number, default: null },
  initialUrl: { type: String, default: '' },
})

const emit = defineEmits(['poster-selected', 'poster-cleared'])

const imageInput = ref(null)
const imageFile = ref(null)
const imagePreviewUrl = ref('')
const isImageDragOver = ref(false)

// Cropper state
const isCropOpen = ref(false)
const cropSrc = ref(null)
const cropAspect = ref(9 / 11)
const cropOutputWidth = ref(1067)
const cropperRef = ref(null)

onMounted(() => {
  if (props.initialUrl) {
    imagePreviewUrl.value = props.initialUrl
  }
})

watch(
  () => props.initialUrl,
  (val) => {
    if (val) {
      imagePreviewUrl.value = val
      imageFile.value = null
    } else {
      imagePreviewUrl.value = ''
      imageFile.value = null
    }
  }
)

watch(
  () => props.templateId,
  (newVal, oldVal) => {
    if (oldVal != null && newVal !== oldVal) {
      if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
      imagePreviewUrl.value = ''
      imageFile.value = null
      setCropForTemplate()
    }
  }
)

function triggerImagePick() {
  imageInput.value?.click()
}

function onImageChosen(e) {
  const file = e.target?.files?.[0]
  if (!file) return
  setCropForTemplate()
  const reader = new FileReader()
  reader.onload = () => {
    cropSrc.value = reader.result
    isCropOpen.value = true
  }
  reader.readAsDataURL(file)
}

function setCropForTemplate() {
  if (props.templateId === 2) {
    cropAspect.value = 9 / 11
    cropOutputWidth.value = 1067
  } else if (props.templateId === 3) {
    cropAspect.value = 3 / 1
    cropOutputWidth.value = 906
  }
}

function handleImageDragEnter() { isImageDragOver.value = true }
function handleImageDragLeave() { isImageDragOver.value = false }
function onImageDrop(e) {
  isImageDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  setCropForTemplate()
  const reader = new FileReader()
  reader.onload = () => {
    cropSrc.value = reader.result
    isCropOpen.value = true
  }
  reader.readAsDataURL(file)
}

function resetCrop() {
  // Reset to full image — reassigning src reinitializes the cropper
  const tmp = cropSrc.value
  cropSrc.value = null
  requestAnimationFrame(() => (cropSrc.value = tmp))
}

function closeCropper() {
  isCropOpen.value = false
  cropSrc.value = null
}

async function confirmCrop() {
  const instance = cropperRef.value
  if (!instance) return
  const result = instance.getResult()
  if (!result || !result.canvas) return

  // Calculate output size from desired width & aspect
  const width = Math.round(cropOutputWidth.value)
  const height = Math.round(width / cropAspect.value)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  // Fill white background for JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  // Draw the cropped canvas fitted into target size
  ctx.drawImage(result.canvas, 0, 0, width, height)

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.9)
  )
  if (!blob) return

  const file = new File([blob], 'poster.jpg', { type: 'image/jpeg' })
  onCropConfirm(file)
}

function onCropConfirm(file) {
  isCropOpen.value = false
  setImageFile(file)
}

function setImageFile(file) {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  emit('poster-selected', { file: imageFile.value, url: imagePreviewUrl.value })
  try { if (imageInput.value) imageInput.value.value = '' } catch {}
}

function clearImage() {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imageFile.value = null
  imagePreviewUrl.value = ''
  emit('poster-cleared')
  try { if (imageInput.value) imageInput.value.value = '' } catch {}
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
