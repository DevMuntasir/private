<script setup>
import { Button } from '@/components/ui/button';
import BillingFund from '../billing.fund/BillingFund.vue'
import { ref } from 'vue';
const showFund = ref(false)

const addFund = () => { 
    showFund.value = true
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-sm text-gray-600 mb-2">Available funds</h3>
            <div class="text-3xl font-bold text-gray-900 mb-4">$356.00</div>
            <Button class=" btn" @click="addFund">
               + ADD FUNDS
            </Button>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-sm text-gray-600 mb-2">Last payment</h3>
            <p class="text-sm text-gray-500 mt-8">You haven't made any payment yet</p>
        </div>
    </div>
    <BillingFund :showFund="showFund" @close="showFund = false"/>
</template>