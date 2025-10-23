<template>
  <div ref="dropdownRef" class="relative w-full min-w-0">
    <!-- Selected items display -->
    <div 
      class="min-h-[42px] w-full min-w-0 flex flex-col justify-center  border border-input bg-background px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent overflow-hidden"
      :class="{ 'ring-2 ring-ring': isOpen }"
      @click="toggleDropdown"
      @blur="$emit('blur')"
      tabindex="0"
    >
      <div class="flex flex-wrap gap-1 min-w-0">
        <span 
          v-if="selectedItems.length === 0"
          class="text-muted-foreground truncate"
        >
          {{ placeholder }}
        </span>
        <span 
          v-for="item in selectedItems" 
          :key="item.value"
          class="inline-flex items-center gap-1 rounded-full bg-secondary font-normal px-2.5 py-0.5 text-[13px] text-white flex-shrink-0 max-w-full"
        >
          <component v-if="item.icon" :is="item.icon" class="h-3 w-3 flex-shrink-0" />
          <span class="truncate">{{ item.label }}</span>
          <button 
            @click.stop="removeItem(item.value)"
            class="ml-1 hover:bg-primary/80 rounded-full p-0.5 transition-colors flex-shrink-0"
          >
            <X class="h-3 w-3" />
          </button>
        </span>
      </div>

      <!-- Dropdown controls -->
      <div class="absolute z-[99999] right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button 
          v-if="selectedItems.length > 0 && clearable"
          @click.stop="clearAll"
          class="p-1 hover:bg-accent rounded transition-colors"
        >
          <X class="h-4 w-4 text-muted-foreground" />
        </button>
        <ChevronDown 
          class="h-4 w-4 text-muted-foreground transition-transform duration-200"
          :class="{ 'rotate-180': !isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown panel -->
    <div 
      v-if="isOpen"
      class="absolute z-[99999] bottom-full w-[300px]  mb-1 min-w-0 rounded-md border bg-popover shadow-xl animate-in fade-in-0 zoom-in-50"
      style="max-width: 100%;"
    >
      <!-- Search input -->
      <div v-if="searchable" class="p-3 border-b">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full min-w-0 pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            @blur="$emit('blur')"
          />
        </div>
      </div>

      <!-- Options list -->
      <div class=" w-full overflow-y-auto p-2">
        <!-- Select All option -->
        <label 
          v-if="selectAll"
          class="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md cursor-pointer transition-colors min-w-0"
        >
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="toggleSelectAll"
            class="h-4 w-4 text-primary border-input rounded focus:ring-ring flex-shrink-0"
          />
          <span class="text-sm truncate">{{ selectAllText }}</span>
        </label>

        <!-- No results message -->
        <div 
          v-if="filteredOptions.length === 0"
          class="px-3 py-2 text-sm text-muted-foreground text-center"
        >
          {{ noResultsText }}
        </div>

        <!-- Individual options -->
        <label 
          v-for="option in filteredOptions" 
          :key="option.value"
          class="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md cursor-pointer transition-colors min-w-0"
        >
          <input
            type="checkbox"
            :checked="isSelected(option.value)"
            @change="toggleItem(option.value)"
            class="h-4 w-4 text-primary border-input rounded focus:ring-ring flex-shrink-0"
          />
          <component v-if="option.icon" :is="option.icon" class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-sm truncate">{{ option.label }}</span>
        </label>
      </div>

      <!-- Footer actions -->
      <div v-if="showFooter" class="flex justify-between p-3 border-t min-w-0">
        <button 
          v-if="clearable"
          @click="clearAll"
          class="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors flex-shrink-0"
        >
          {{ clearText }}
        </button>
        <button 
          @click="closeDropdown"
          class="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors ml-auto flex-shrink-0"
        >
          {{ closeText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, X, Search } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select options...' },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'Search...' },
  selectAll: { type: Boolean, default: false },
  selectAllText: { type: String, default: 'Select All' },
  noResultsText: { type: String, default: 'No results found.' },
  clearable: { type: Boolean, default: false },
  clearText: { type: String, default: 'Clear' },
  closeText: { type: String, default: 'Close' },
  showFooter: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'blur']);

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref(null);

const selectedValues = computed(() => props.modelValue);

const selectedItems = computed(() =>
  props.options.filter(option => selectedValues.value.map(String).includes(String(option.value)))

);

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => option.label.toLowerCase().includes(query));
});

const isAllSelected = computed(() =>
  filteredOptions.value.length > 0 &&
  filteredOptions.value.every(option => selectedValues.value.includes(option.value))
);

const isIndeterminate = computed(() =>
  selectedValues.value.length > 0 &&
  selectedValues.value.length < filteredOptions.value.length
);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const isSelected = (value) => selectedValues.value.map(String).includes(String(value));

const toggleItem = (value) => {
  const newValues = [...selectedValues.value];
  const index = newValues.indexOf(value);
  if (index > -1) {
    newValues.splice(index, 1);
  } else {
    newValues.push(value);
  }
  emit('update:modelValue', newValues);
};

const removeItem = (value) => {
  const newValues = selectedValues.value.filter(item => item !== value);
  emit('update:modelValue', newValues);
};

const clearAll = () => {
  emit('update:modelValue', []);
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    emit('update:modelValue', []);
  } else {
    const allValues = filteredOptions.value.map(option => option.value);
    emit('update:modelValue', allValues);
  }
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
