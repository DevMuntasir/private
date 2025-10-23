<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useBillingStore } from "@/store/client/client-billing-store";
import { BillingPayload } from "@/types/client-billing-type";
import { ChevronDownIcon, Loader } from "lucide-vue-next";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const billingStore = useBillingStore();

defineEmits<{
  (e: "addPaymentProfile"): void;
  (e: "addPaymentMethod"): void;
  (e: "showTerms"): void;
  (e: "cancel"): void;
}>();


const schema = yup.object({
  billing_country: yup.number().required("Country is required"),
  time_zone: yup.string().required("Timezone is required"),
  currency: yup.number().required("Currency is required").default(1),
  paymentProfile: yup.number().default(1),
});

const { handleSubmit, errors } = useForm<BillingPayload>({
  validationSchema: schema,
  initialValues: {
    billing_country: billingStore.paymentSettings.billing_country || 1,
    time_zone: billingStore.paymentSettings.time_zone || "Asia/Dhaka",
    currency: billingStore.paymentSettings.currency || 1,
    payment_method_id: billingStore.paymentSettings.payment_method_id || 1,
  },
});

const { value: country } = useField<string>("billing_country");
const { value: timezone } = useField<string>("time_zone");
const { value: currency } = useField<string>("currency");

const onSubmit = handleSubmit(async (values) => {
  await billingStore.createBillingProfile(values);
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="max-w-3xl space-y-2">
    <div class="bg-white  p-6 shadow-sm">
      <h3 class="text-[16px] font-medium text-gray-900 mb-4 font-primary ">Billing Country</h3>
      <div class="space-y-4">
        <div class="relative">
          <select
            v-model="country"
            class="w-full px-3 py-3 border border-gray-300  text-sm focus:outline-none  appearance-none bg-white"
          >
            <option disabled value="">Select Country</option>
            <option :value="1">Bangladesh</option>
          </select>
          <ChevronDownIcon
            class="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <p v-if="errors.billing_country" class="text-sm text-red-500 mt-1">
            {{ errors.billing_country }}
          </p>
        </div>

        <!-- Timezone -->
        <div class="relative">
          <select
            v-model="timezone"
            class="w-full px-3 py-3 border border-gray-300  text-sm focus:outline-none  appearance-none bg-white"
          >
            <option disabled value="">Select Timezone</option>
            <option value="Asia/Dhaka">Asia/Dhaka</option>
          </select>
          <ChevronDownIcon
            class="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <p v-if="errors.time_zone" class="text-sm text-red-500 mt-1">
            {{ errors.time_zone }}
          </p>
        </div>

        <p class="text-xs text-gray-500">
          Timezone applies to your entire account and cannot be changed later.
        </p>

        <!-- Currency -->
        <div class="relative">
          <select
            v-model="currency"
            class="w-full px-3 py-3 border border-gray-300  text-sm focus:outline-none    appearance-none bg-white"
          >
            <option value="">Select Currency</option>
            <option :value="1">BDT (Bangladeshi Taka)</option>
          </select>
          <ChevronDownIcon
            class="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <p v-if="errors.currency" class="text-sm text-red-500 mt-1">
            {{ errors.currency }}
          </p>
        </div>
      </div>
      <div class="flex justify-end">
        <Button
          :disabled="billingStore.isLoading || billingStore.isBilling"
          type="submit"
          class="btn mt-5 ml-auto"
        >
          <Loader v-if="billingStore.isLoading" />

          SAVE</Button
        >
      </div>
    </div>
  </form>
</template>
