<script setup>
import { Button } from "@/components/ui/button";
import { useGoBack } from "@/composeable/useGoBack";
import { ArrowLeft } from "lucide-vue-next";
import { defineProps } from "vue";

defineProps({
  title: {
    type: String,
  },
});

const { goBack } = useGoBack(); 
</script>

<template>
  <div class="p-4 md:p-6 box-border overflow-hidden">
    <div v-if="title">
      <div  class="flex items-center gap-3">
        <Button
          @click="goBack()"
          variant="ghost"
          size="icon"
          class="w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <h1 class="text-2xl font-primary font-semibold text-orange-highlight capitalize">
          {{ title }}
        </h1>
      </div>
    </div>
    <div class=" overflow-hidden">
      <slot />
    </div>
  </div>
</template>
