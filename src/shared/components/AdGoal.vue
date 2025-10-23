
<script setup lang="ts">

import { Card, CardContent } from '@/components/ui/card';
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ goal?: number; confirmOnChange?: boolean }>()

const emit = defineEmits<{
  (e: 'update:goal', value: number): void
  (e: 'request:goal-change', value: number): void
}>()

const selectedGoal = ref(props.goal ?? 1)

watch(
  () => props.goal,
  (val) => {
    if (typeof val === 'number' && val !== selectedGoal.value) {
      selectedGoal.value = val
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (typeof props.goal === 'number') {
    selectedGoal.value = props.goal
  }
})

const baseCardClass = 'cursor-pointer border-2 border-border  transition hover:border-yellow-500'
const activeCardClass = 'cursor-pointer border-2 border-yellow-500 '

const selectGoal = (goal: number) => {
  // If edit mode confirmation is enabled, only prompt when changing selection
  if (props.confirmOnChange) {
    if (selectedGoal.value !== goal) {
      emit('request:goal-change', goal)
    }
    return
  }
  if (selectedGoal.value !== goal) selectedGoal.value = goal
  emit('update:goal', goal)
}

</script>


<template>
  <div class="grid grid-cols-3 gap-6 my-5">
    <div class="col-span-3 bg-white px-8 py-10 rounded-[3px]">
      <h2 class="text-[18px]  font-primary font-semibold mb-4 text-[#4C4C4D]">Choose your goal</h2>
      <div class="grid grid-cols-3 gap-4">
        <Card
           class=" rounded-none"
          :class="selectedGoal === 1 ? activeCardClass : baseCardClass"
          @click="selectGoal(1)"
        >
          <CardContent class="flex flex-col items-start space-y-2">
            <div class="text-yellow-500 text-2xl"> <img src="/public/icons/1.svg" alt="" /></div>
            <h3 class="font-medium">Awareness</h3>
            <p class="text-sm text-muted-foreground">
              Reach a broad, hyper-local and ready-to-buy audience to build interest in your brand/product.
            </p>
          </CardContent>
        </Card>
        <Card
           class=" rounded-none"
          :class="selectedGoal === 2 ? activeCardClass : baseCardClass"
          @click="selectGoal(2)"
        >
          <CardContent class="flex flex-col items-start space-y-2">
            <div class="text-yellow-500 text-2xl"> <img src="/public/icons/1.svg" alt="" /></div>
            <h3 class="font-medium">Traffic</h3>
            <p class="text-sm text-muted-foreground">
              Get people to visit your website.
            </p>
          </CardContent>
        </Card>



        <Card class="relative bg-muted pointer-events-none opacity-60 rounded-none">
          <CardContent class="flex flex-col items-start space-y-2">
            <div class="text-gray-400 text-2xl"> <img src="/public/icons/3.svg" alt="" /></div>
            <h3 class="font-medium text-gray-600">In-store promotion</h3>
            <p class="text-sm text-gray-500">Promote products the store is already carrying to boost sales.</p>
          </CardContent>
          <div class="absolute top-0 right-0 bg-orange-600 text-white text-xs px-2 py-1 rounded-bl-lg">
            Coming soon
          </div>
        </Card>
      </div>
    </div>

  </div>
</template>


