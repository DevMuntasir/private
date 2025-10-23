<!-- SearchAndFilterBar.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusCircle, X } from 'lucide-vue-next'       // <-- add X
import { AdConstant } from '@/constant/ads'
import { CampaignConstant } from '@/constant/campaign'

const props = defineProps<{
  searchQuery: string
  modelValue: Record<string, any>
  selectedFilters: string[]
  filterOptions: { label: string; value: string; disable?: boolean }[]
  searchable?: boolean
  canSearch?: boolean 
  canFilter?: boolean
  placeholder?: string
  filterFor?: 'ad' | 'campaign' | 'other'
}>()

const emit = defineEmits(['update:searchQuery','update:modelValue','update:selectedFilters'])
const isFilterOpen = ref(false)

function toggleFilter(key: string, checked: boolean) {
  const updated = [...props.selectedFilters]
  if (checked && !updated.includes(key)) updated.push(key)
  else if (!checked) updated.splice(updated.indexOf(key), 1)
  emit('update:selectedFilters', updated)
}

/** bridge status <-> select value:
 *   null/undefined  -> ''   (show placeholder)
 *   number/string   -> string
 */
const statusProxy = computed<string>({
  get() {
    const v = props.modelValue?.status
    return v == null ? '' : String(v)
  },
  set(v: string) {
    const next = v === '' ? null : Number(v)
    emit('update:modelValue', { ...props.modelValue, status: next })
  }
})

const preserveFocusKey = computed(() => props.filterFor ? `search-${props.filterFor}` : 'search-default')

const statusOptions = computed<{ value: string; label: string }[]>(() => {
  if (props.filterFor === 'ad') {
    return [
      { value: String(AdConstant.STATUS_ACTIVE), label: 'Active' },
      { value: String(AdConstant.STATUS_PAUSE), label: 'Paused' },
      // { value: String(AdConstant.STATUS_COMPLETED), label: 'Completed' },
      { value: String(AdConstant.STATUS_REJECTED), label: 'Rejected' },
      { value: String(AdConstant.STATUS_REVIEW), label: 'Under Review' },
    ]
  }

  if (props.filterFor === 'campaign') {
    return [
      { value: String(CampaignConstant.STATUS_ACTIVE), label: 'Active' },
      { value: String(CampaignConstant.STATUS_PAUSE), label: 'Paused' },
      { value: String(CampaignConstant.STATUS_COMPLETED), label: 'Completed' },
      { value: String(CampaignConstant.STATUS_REJECT), label: 'Rejected' },
      { value: String(CampaignConstant.STATUS_REVIEW), label: 'Under Review' },
    ]
  }

  return [
    { value: String(CampaignConstant.STATUS_ACTIVE), label: 'Active' },
    { value: String(CampaignConstant.STATUS_REVIEW), label: 'Under Review' },
  ]
})
</script>

<template>
  <div class="pr-6 pl-4 py-4 flex justify-between items-center border-b">
    <div class="w-full">
      <div class="w-full flex flex-wrap gap-4 items-center">
        <Input
          v-if="searchable && canSearch"
          :model-value="searchQuery"
          @update:modelValue="val => emit('update:searchQuery', val)"
          :placeholder="placeholder ?? 'Search by name...'"
          class="max-w-[270px] !h-[40px] w-full form-input" :data-preserve-focus="preserveFocusKey"
        />

        <!-- Status filter -->
        <template v-if="selectedFilters.includes('status')">
          <div class="flex items-center gap-2">
            <Select v-model="statusProxy">
              <SelectTrigger class="w-[160px] font-primary !h-[45px] rounded-[3px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent v-if="statusOptions.length">
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Clear button sets v-model to '' (placeholder), which we map to null -->
            <Button
              v-if="modelValue?.status != null"
              variant="ghost"
              size="sm"
              class="!h-[45px] px-2"
              @click="statusProxy = ''"
              aria-label="Clear status filter"
              title="Clear"
            >
              <X :size="16" />
            </Button>
          </div>
        </template>

        <!-- more filters later -->
      </div>
    </div>

    <Popover v-model:open="isFilterOpen" v-if="canFilter">
      <PopoverTrigger as-child>
        <Button variant="ghost" class=" text-secondary">
          <PlusCircle class="mr-1" /> Add Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[150px] space-y-2 z-[100]">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Select Filters</h4>
        <div class="space-y-2">
          <div v-for="option in filterOptions" :key="option.value" class="flex items-center gap-2">
            <Checkbox
              :id="option.value"
              class="checkbox"
              :disabled="option.disable"
              :model-value="selectedFilters.includes(option.value)"
              @update:modelValue="checked => toggleFilter(option.value, checked as boolean)"
            />
            <label :for="option.value" class="text-sm text-gray-700">
              {{ option.label }}
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
