<template>
  <div v-if="lastPage > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
    <div class="text-sm text-gray-600">
      Showing {{ from }} to {{ to }} of {{ total }} results
    </div>

    <div class="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        class="h-8 w-8 p-0"
        :disabled="currentPage === 1"
        @click="$emit('page-change', 1)"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l3.293 3.293a1 1 0 010 1.414zM6 6a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="h-8 w-8 p-0"
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </Button>

      <Button
        v-for="page in visiblePages"
        :key="page"
        :variant="page === currentPage ? 'default' : 'outline'"
        size="sm"
        class="h-8 w-8 p-0"
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="h-8 w-8 p-0"
        :disabled="currentPage === lastPage"
        @click="$emit('page-change', currentPage + 1)"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="h-8 w-8 p-0"
        :disabled="currentPage === lastPage"
        @click="$emit('page-change', lastPage)"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0zM4 4a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed } from 'vue'

interface Props {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  from: number
  to: number
}

const props = defineProps<Props>()

defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(props.lastPage, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})
</script>
