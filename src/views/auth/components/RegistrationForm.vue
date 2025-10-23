<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

import { loadPendingOtpFromStorage, useAuthStore } from "@/store/auth-store";
import { OTP_VALIDITY_SECONDS } from "@/constant/auth";
import { RegistrationSchema } from "@/types/auth-types";
import { LoaderIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage, useField, useForm } from "vee-validate";
import AuthError from "./AuthError.vue";
import AuthSuccess from "./AuthSuccess.vue";
import AuthTitle from "./AuthTitle.vue";
import VerifyCode from "./VerifyCode.vue";

const props = defineProps<{
  redirectTo?: string;
  submitLabel?: string;
  showVerifyCode?: boolean;
}>();


const authStore = useAuthStore();

const title = ref("Create Account");
const successMessage = ref("");
const showVerify = ref(false);
const otpRef = ref();


// Form setup
const { handleSubmit, errors, isSubmitting, setFieldError } = useForm({
  validationSchema: RegistrationSchema,
  initialValues: {
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  },
});

const { value: name } = useField<string>("name");
const { value: email } = useField<string>("email");
const { value: phone } = useField<string>("phone");
const { value: password } = useField<string>("password");
const { value: password_confirmation } = useField<string>("password_confirmation");

// Handle form submit
const onSubmit = handleSubmit(async (values) => {
  try {
    const res = await authStore.register(values);
    if (res.success) {
      successMessage.value = "Registration successful! Please verify your code.";
      showVerify.value = true;
      title.value = "Verify Your Phone";
      nextTick(() => {
        otpRef.value?.sendOtp(true);
      });
    }

    const backendErrors = res?.error?.response?.data?.errors;
    if (backendErrors) {
      for (const field in backendErrors) {
        const message = backendErrors[field]?.[0];
        if (message) {
          setFieldError(field as keyof typeof values, message);
        }
      }
    }
  } catch (err) {
    console.error("Registration failed:", err);
  }
});



onMounted(() => {
  if (!props.showVerifyCode) {
    return;
  }

  const pendingOtp = loadPendingOtpFromStorage();
  if (!pendingOtp) {
    return;
  }

  const remainingMs = pendingOtp.expiresAt - Date.now();
  if (remainingMs <= 0) {
    return;
  }

  showVerify.value = true;
  title.value = "Verify Your Phone";
  successMessage.value = "Registration successful! Please verify your code.";
  authStore.email = pendingOtp.email;

  nextTick(() => {
    const remainingSeconds = Math.max(
      0,
      Math.min(OTP_VALIDITY_SECONDS, Math.ceil(remainingMs / 1000))
    );

    otpRef.value?.startCountdown(remainingSeconds);
  });
});


defineExpose({
  onSubmit,
  successMessage,
});
</script>

<template>
  <AuthTitle :title="title" />

  <!-- REGISTRATION FORM -->
  <form v-if="!showVerify" @submit.prevent="onSubmit" class="space-y-4">
    <AuthError :authStore="authStore" />
    <AuthSuccess :successMessage="successMessage" />

    <div class="space-y-2">
      <Input id="name" v-model="name" placeholder="Enter your name"
        :class="{ 'border-red-500': errors.name }"
        class="auth-input"
        :disabled="authStore.isLoading || isSubmitting"
      />
      <ErrorMessage name="name" class="text-sm text-red-600" />
    </div>

    <div class="space-y-2">
      <Input id="email" v-model="email" type="email" placeholder="Enter your email"
        :class="{ 'border-red-500': errors.email }"
        class="auth-input"
        :disabled="authStore.isLoading || isSubmitting"
      />
      <ErrorMessage name="email" class="text-sm text-red-600" />
    </div>

    <div class="space-y-2">
      <vue-tel-input
        v-model="phone"
        :autoFormat="false"
        class="placeholder:!text-[12px] auth-input !pl-0 focus-within:!shadow-none !border-orange-highlight"
      />
      <ErrorMessage name="phone" class="text-sm text-red-600" />
    </div>

    <div class="space-y-2">
      <Input id="password" v-model="password" type="password" placeholder="Enter your password"
        :class="{ 'border-red-500': errors.password }"
        class="auth-input"
        :disabled="authStore.isLoading || isSubmitting"
      />
      <ErrorMessage name="password" class="text-sm text-red-600" />
    </div>

    <div class="space-y-2">
      <Input id="password_confirmation" v-model="password_confirmation" type="password" placeholder="Confirm password"
        :class="{ 'border-red-500': errors.password_confirmation }"
        class="auth-input"
        :disabled="authStore.isLoading || isSubmitting"
      />
      <ErrorMessage name="password_confirmation" class="text-sm text-red-600" />
    </div>

    <div class="w-full flex justify-center mt-[30px]">
      <Button type="submit" class="btn w-[200px] mx-auto px-10">
        <LoaderIcon
          v-if="authStore.isLoading || isSubmitting"
          class="animate-spin -ml-1 mr-3 h-5 w-5"
        />
        {{
          authStore.isLoading || isSubmitting
            ? "Submitting..."
            : props.submitLabel || "SUBMIT"
        }}
      </Button>
    </div>
  </form>

  <!-- VERIFY CODE SECTION -->
  <div v-else>
    <VerifyCode ref="otpRef" v-if="showVerify" />

  </div>
</template>

<style scoped>
.auth-input {
  transition: all 0.2s ease-in-out;
}

.auth-input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
</style>
