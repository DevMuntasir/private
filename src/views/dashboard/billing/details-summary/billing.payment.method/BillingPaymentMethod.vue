

<script setup>
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ref, reactive } from 'vue'

const selectedPaymentMethod = ref('b-cash')

const creditCardData = reactive({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    ownerName: ''
})




const formatCardNumber = (event) => {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
    if (formattedValue.length > 19) {
        formattedValue = formattedValue.substring(0, 19)
    }
    creditCardData.cardNumber = formattedValue
}

const formatExpiryDate = (event) => {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }
    creditCardData.expiryDate = value
}




const {showPaymentMethod} = defineProps({
    showPaymentMethod:{
        type : Boolean
    }
})
defineEmits(['close'])

</script>

<template>
    <Dialog :open="showPaymentMethod" @update:open="$emit('close')">
        <DialogContent class="sm:max-w-[525px] max-h-[80vh] overflow-hidden" c>
            <DialogHeader>
                <DialogTitle>Payment Method</DialogTitle>
            </DialogHeader>
            <ScrollArea class="max-h-[50vh] w-full mx-auto  bg-white overflow-hidden py-5">
                <div class="space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-start space-x-3">
                            <div class="flex items-center h-5">
                                <input v-model="selectedPaymentMethod" type="radio" value="credit-card"
                                    class="w-4 h-4 text-orange-600 bg-white border-gray-300 focus:ring-orange-500 focus:ring-2" />
                            </div>
                            <div class="flex-1">
                                <label class="text-sm font-medium text-gray-900 cursor-pointer">
                                    Credit card
                                </label>
                                <p class="text-xs text-gray-500 mt-1">
                                    Amount campaign max. USD100 (just sample)
                                </p>
                            </div>
                        </div>

                        <!-- Credit Card Form Fields -->
                        <div v-show="selectedPaymentMethod === 'credit-card'" class="ml-7 space-y-4 pt-2">
                            <!-- Card Number -->
                            <div>
                                <Input v-model="creditCardData.cardNumber" type="text" placeholder="Card Number"
                                    class="form-input"
                                    maxlength="19" @input="formatCardNumber" />
                            </div>

                            <!-- Expiry Date and CVV -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <Input v-model="creditCardData.expiryDate" type="text"
                                        placeholder="Expired date 02/28"
                                        class="form-input"
                                        maxlength="5" @input="formatExpiryDate" />
                                </div>
                                <div>
                                    <Input v-model="creditCardData.cvv" type="text" placeholder="CVV"
                                        class="form-input"
                                        maxlength="4" />
                                </div>
                            </div>

                            <!-- Owner Name -->
                            <div>
                                <Input v-model="creditCardData.ownerName" type="text" placeholder="Owner Name"
                                    class="form-input" />
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="flex items-center h-5">
                            <input v-model="selectedPaymentMethod" type="radio" value="b-cash"
                                class="w-4 h-4 text-orange-600 bg-white border-gray-300 focus:ring-orange-500 focus:ring-2" />
                        </div>
                        <div class="flex-1">
                            <label class="text-sm font-medium text-gray-900 cursor-pointer">
                                B Cash
                            </label>
                            <p class="text-xs text-gray-500 mt-1">
                                Amount campaign max. USD100 (just sample)
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="flex items-center h-5">
                            <input v-model="selectedPaymentMethod" type="radio" value="bank-transfer"
                                class="w-4 h-4 text-orange-600 bg-white border-gray-300 focus:ring-orange-500 focus:ring-2" />
                        </div>
                        <div class="flex-1">
                            <label class="text-sm font-medium text-gray-900 cursor-pointer">
                                Bank Transfer
                            </label>
                            <p class="text-xs text-gray-500 mt-1">
                                This option needs to be activated by ChutneyAds Account Manager.
                            </p>
                        </div>
                    </div>
                </div>
   
            </ScrollArea>
            <DialogFooter class=" gap-3 flex">
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
<style scoped>
/* Custom radio button styling */
input[type="radio"]:checked {
    background-color: #ea580c;
    border-color: #ea580c;
}

input[type="radio"]:checked:hover {
    background-color: #dc2626;
    border-color: #dc2626;
}

input[type="radio"]:focus {
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}

/* Focus states for form elements */
input[type="text"]:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Disabled button styling */
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Smooth transitions */
input,
button {
    transition: all 0.2s ease-in-out;
}
</style>




