<template>
  <div>
    <div class="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg p-4 border border-border ">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Countries</p>
            <p class="text-2xl font-bold text-primary">{{ statistics?.totalCountries }}</p>
          </div>
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-4 border border-border ">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">States</p>
            <p class="text-2xl font-bold text-secondary">{{ statistics?.totalStates }}</p>
          </div>
          <div class="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-4 border border-border ">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Cities</p>
            <p class="text-2xl font-bold ">{{ statistics?.totalCities }}</p>
          </div>
          <div class="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-4 border border-border ">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Areas</p>
            <p class="text-2xl font-bold text-emerald-600">{{ statistics?.totalAreas }}</p>
          </div>
          <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { locationService } from '@/services/location-service'
import type { LocationStatistics } from '@/types/location-types'



const locationStats = ref<LocationStatistics | null>(null)
const isLoadingStats = ref(false)

const statistics = computed(() => {
  if (locationStats.value) {
    return {
      totalCountries: locationStats.value.country,
      totalStates: locationStats.value.state,
      totalCities: locationStats.value.city,
      totalAreas: locationStats.value.location,
    }
  }
})



const fetchLocationStatistics = async () => {
  try {
    isLoadingStats.value = true
    const response = await locationService.getLocationStatistics()
    if (response.success) {
      locationStats.value = response.data
    }
  } catch (error) {
    console.error('Failed to load location statistics', error)
  } finally {
    isLoadingStats.value = false
  }
}





onMounted(async () => {
  await fetchLocationStatistics()
})
</script>


