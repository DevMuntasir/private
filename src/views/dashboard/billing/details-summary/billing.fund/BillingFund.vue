<script setup>
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusIcon } from 'lucide-vue-next'
import {  ref } from 'vue'

const selectedPaymentMethod = ref('Money Transfer')
const paymentAmount = ref('')
const amountError = ref('')

const accountData = {
    companyName: 'Dark Moon Corp',
    currentBalance: 356.00
}

// const isFormValid = computed(() => {
//     return paymentAmount.value &&
//         parseFloat(paymentAmount.value) > 0 &&
//         !amountError.value
// })

const validateAmount = () => {
    const amount = parseFloat(paymentAmount.value)

    if (paymentAmount.value && (isNaN(amount) || amount <= 0)) {
        amountError.value = 'Please enter a valid amount greater than 0'
    } else if (amount > 10000) {
        amountError.value = 'Maximum amount is $10,000'
    } else {
        amountError.value = ''
    }
}

const showPaymentMethods = () => { }

// const cancel = () => {
//     paymentAmount.value = ''
//     amountError.value = ''
// }

// const addFunds = () => {
//     if (!isFormValid.value) {
//         return
//     }

//     const fundData = {
//         paymentMethod: selectedPaymentMethod.value,
//         amount: parseFloat(paymentAmount.value),
//         currentBalance: accountData.currentBalance
//     }

//     alert(`Adding $${paymentAmount.value} to ${accountData.companyName} account`)
// }

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}
const { showFund } = defineProps({
    showFund: {
        type: Boolean
    }

}
)
defineEmits(['close'])
</script>


<template>

    <Dialog :open="showFund" @update:open="$emit('close')">

        <DialogContent class="sm:max-w-[525px] h-[90vh] overflow-hidden" c>
            <DialogHeader>
                <DialogTitle>Add Funds</DialogTitle>
               
            </DialogHeader>
            <ScrollArea class="max-h-[70vh] w-full mx-auto  bg-white overflow-hidden">
                    <div class="bg-white p-6">
        
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h2 class="text-lg font-medium text-gray-900">Dark Moon Corp</h2>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-600 mb-1">Current Balance</p>
                                <p class="text-2xl font-bold text-gray-900">{{
                                    formatCurrency(accountData.currentBalance) }}</p>
                            </div>
                        </div>

                        <hr class="border-gray-200 mb-6">

                        <div class="mb-8">
                            <p class="text-sm text-gray-600 leading-relaxed">
                                Your account is set to make manual payments. Add funds to cover your future service
                                costs.
                            </p>
                        </div>

                        <div class="mb-8">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Payment method</h3>

                            <div class="relative">
                                <div class="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center"
                                    @click="showPaymentMethods">
                                    <span class="text-gray-700">{{ selectedPaymentMethod }}</span>
                                    <button class="text-red-600 hover:text-red-700 focus:outline-none">
                                        <PlusIcon class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p class="text-xs text-gray-500 mt-2">
                                Information about transferring money to ChutneyAds will appear on invoice.
                            </p>
                        </div>

                        <div class="mb-12">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Amount</h3>

                            <div class="relative">
                                <input v-model="paymentAmount" type="number" placeholder="Amount" min="0" step="0.01"
                                    class="fonm-input" @input="validateAmount" />
                                <div v-if="amountError" class="text-red-500 text-xs mt-1">
                                    {{ amountError }}
                                </div>
                            </div>
                        </div>
                    </div>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" @click="$emit('close')">
                    Close
                </Button>
                <Button type="submit" class="btn">
                    Save changes
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>


</template>
