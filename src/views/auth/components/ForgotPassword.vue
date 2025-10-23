<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { LoaderIcon } from "lucide-vue-next";
import { ref } from "vue";


import { LOGIN } from "@/constant";
import { authService } from "@/services/auth-service";
import { ErrorMessage, useField, useForm } from "vee-validate";
import * as yup from "yup";
import AuthError from "./AuthError.vue";
import AuthLogo from "./AuthLogo.vue";
import AuthSideImage from "./AuthSideImage.vue";
import AuthSuccess from "./AuthSuccess.vue";
import AuthTitle from "./AuthTitle.vue";
import Copywrite from "./Copywrite.vue";
const isLoading = ref(false);
const error = ref<string | null>(null);


const authStore = useAuthStore();

const successMessage = ref<string | null>(null);

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: yup.object({
    email: yup
      .string()
      .required("Email is required")
      .email("Must be a valid email"),
  }),
  initialValues: {
    email: "",
  },
});

const { value: email } = useField<string>("email");

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    await authService.forgotPassword(values.email);

    successMessage.value = "If your email exists, a reset link has been sent.";
  } catch (err) {
    console.error("Forgot password failed", err);
    error.value = err instanceof Error ? err.message : "Something went wrong";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="bg-gray-100 flex items-center justify-center min-h-screen">
    <AuthSideImage />

    <div
      class="w-full lg:w-1/2 text-center h-screen bg-white space-y-5 flex flex-col justify-center items-center relative px-4"
    >
      <div class="space-y-10 max-w-[400px] w-full mx-auto">
        <AuthLogo />
        <AuthTitle :title="'Forgot Password'" />

        <AuthError :authStore="authStore" />
        <AuthSuccess :successMessage="successMessage" />


        <form @submit.prevent="onSubmit" class="space-y-4 text-left">
          <div class="space-y-2">
            <Label for="email">Email Address</Label>
            <Input
              id="email"
              v-model="email"
              class="auth-input"
              type="email"
              placeholder="Enter your email"
              :class="{ 'border-red-500': errors.email }"
              :disabled="authStore.isLoading || isSubmitting"
            />
            <ErrorMessage name="email" class="text-sm text-red-600" />
          </div>

          <Button type="submit" class="btn px-10 w-full">
            <LoaderIcon
              v-if="isLoading || isSubmitting"
              class="animate-spin -ml-1 mr-3 h-5 w-5"
            />
            {{ isLoading || isSubmitting ? "Sending..." : "Send Reset Link" }}
          </Button>
        </form>
      </div>

      <p class="font-primary text-gray-600">
        Remember your password?
        <router-link
          :to="LOGIN"
          class="text-secondary hover:text-primary font-medium"
        >
          Login
        </router-link>
      </p>

      <Copywrite />
    </div>
  </div>
</template>

<style scoped>
.auth-logo {
  height: 60px;
  width: auto;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}
</style>
