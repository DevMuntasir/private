<template>
  <div class="flex gap-2 w-full max-w-md">
    <div class="relative flex-1">
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
      </svg>
      <Input
        v-model="searchQuery"
        :placeholder="placeholder"
        class="pl-10 pr-10"
        @keypress="handleKeyPress"
      />
      <Button
        v-if="searchQuery"
        variant="ghost"
        size="sm"
        class="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
        @click="handleClear"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </Button>
    </div>
    <Button @click="handleSearch" size="sm">
      Search
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Input from './ui/Input.vue'
import Button from './ui/Button.vue'

interface Props {
  placeholder?: string
  defaultValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search users...',
  defaultValue: ''
})

const emit = defineEmits<{
  search: [query: string]
}>()

const searchQuery = ref(props.defaultValue)

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleClear = () => {
  searchQuery.value = ''
  emit('search', '')
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

// Watch for external changes to defaultValue
watch(() => props.defaultValue, (newValue) => {
  searchQuery.value = newValue
})
</script>
