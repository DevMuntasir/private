<script setup>
import { ChevronDownIcon } from 'lucide-vue-next'
import { reactive } from 'vue'

const toggleMonth = (month) => {
    expandedMonths[month] = !expandedMonths[month]
}
const expandedMonths = reactive({
    may: false,
    april: false
})


</script>

<template>
    <div class="space-y-2">
        <div class="bg-white rounded-lg shadow-sm">
            <div class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                @click="toggleMonth('may')">
                <div class="flex items-center space-x-4">
                    <span class="text-sm font-medium text-gray-900">May (current month)</span>
                </div>
                <div class="flex items-center space-x-8">
                    <div class="text-right">
                        <div class="text-xs text-gray-500">Net cost</div>
                        <div class="text-sm font-medium">$267</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">Payment</div>
                        <div class="text-sm font-medium">$267</div>
                    </div>
                    <ChevronDownIcon
                        :class="['w-4 h-4 text-gray-400 transition-transform', { 'rotate-180': expandedMonths.may }]" />
                </div>
            </div>
            <div v-show="expandedMonths.may" class="px-4 pb-4 border-t border-gray-100">
                <div class="pt-4 text-sm text-gray-600">
                    <p>Detailed breakdown for May billing period...</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm">
            <div class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                @click="toggleMonth('april')">
                <div class="flex items-center space-x-4">
                    <span class="text-sm font-medium text-gray-900">April</span>
                </div>
                <div class="flex items-center space-x-8">
                    <div class="text-right">
                        <div class="text-xs text-gray-500">Net cost</div>
                        <div class="text-sm font-medium">$0</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">Payment</div>
                        <div class="text-sm font-medium">$0</div>
                    </div>
                    <ChevronDownIcon
                        :class="['w-4 h-4 text-gray-400 transition-transform', { 'rotate-180': expandedMonths.april }]" />
                </div>
            </div>
            <div v-show="expandedMonths.april" class="px-4 pb-4 border-t border-gray-100">
                <div class="pt-4 text-sm text-gray-600">
                    <p>No billing activity for April...</p>
                </div>
            </div>
        </div>
    </div>
</template>