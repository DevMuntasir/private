<template>
  <div class="w-[700px]">
    <h1 class="text-[22px] font-primary text-[#4C4C4D] font-semibold">
      Tell us about your business
    </h1>

    <div class="bg-white mt-8 p-6">
      <label class="block mb-2 text-lg font-primary font-semibold">
        What's your business name?*
      </label>
      <input
        type="text"
        v-model="store.businessInfo.name"
        placeholder="Enter your registered business name"
        :class="{ 'border-red-500': errors['businessInfo.name'] }"
        maxlength="255"
        class="w-full form-input"
        data-field="name"
        @input="handleInput('businessInfo.name', store.businessInfo.name)"
        @blur="() => validateField('businessInfo.name', store.businessInfo.name)"
      />
      <div class="flex justify-between items-center">
        <p class="text-xs text-gray-500 mt-1">Example: ABC Digital Ltd.</p>
        <p
          class="text-xs mt-1 ml-auto"
          :class="
            store.businessInfo.name.length >= 255
              ? 'text-red-500'
              : 'text-gray-500'
          "
        >
          {{ store.businessInfo.name.length }}/255
        </p>
      </div>
      <p v-if="errors['businessInfo.name']" class="text-red-500 text-xs mt-1">
        {{ errors['businessInfo.name'] }}
      </p>
    </div>

    <div class="bg-white mt-6 p-6">
      <label class="block mb-2 text-lg font-primary font-semibold">
        Business Registration Number*
      </label>
      <input
        type="text"
        v-model="store.businessInfo.reg_number"
        placeholder="Enter your registration number"
        :class="{ 'border-red-500': errors['businessInfo.reg_number'] }"
        maxlength="100"
        class="w-full form-input"
        data-field="reg_number"
        @input="
          handleInput(
            'businessInfo.reg_number',
            store.businessInfo.reg_number
          )
        "
        @blur="
          () =>
            validateField(
              'businessInfo.reg_number',
              store.businessInfo.reg_number
            )
        "
      />
      <div class="flex justify-between items-center">
        <p class="text-xs text-gray-500 mt-1">Example: 1234567890</p>
        <p
          class="text-xs mt-1 ml-auto"
          :class="
            store.businessInfo.reg_number.length >= 100
              ? 'text-red-500'
              : 'text-gray-500'
          "
        >
          {{ store.businessInfo.reg_number.length }}/100
        </p>
      </div>
      <p
        v-if="errors['businessInfo.reg_number']"
        class="text-red-500 text-xs mt-1"
      >
        {{ errors['businessInfo.reg_number'] }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStepperStore } from "../store/stepper.store";

const store = useStepperStore();

const props = defineProps<{
  errors: Record<string, string>;
  validateField: (path: string, value: unknown) => void;
}>();

function handleInput(path: string, value: string) {
  props.validateField(path, value);
}
</script>

