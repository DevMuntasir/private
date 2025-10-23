<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useForm, useField, ErrorMessage } from "vee-validate";
import { LOGIN } from "@/constant";
import { authService } from "@/services/auth-service";
import { resetPasswordSchema } from "@/types/auth-types";
import AuthSideImage from "./AuthSideImage.vue";
import AuthTitle from "./AuthTitle.vue";
import AuthLogo from "./AuthLogo.vue";
import AuthError from "./AuthError.vue";
import AuthSuccess from "./AuthSuccess.vue";
import Copywrite from "./Copywrite.vue";

const router = useRouter();
const route = useRoute();

const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const token = route.query.token as string | undefined;
const email = route.query.email as string | undefined;


if (!token ) {
  error.value = "Invalid or missing token.";
}
if (!email) {
  error.value = "Invalid or missing email.";
}
const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: resetPasswordSchema,
  initialValues: {
    password: "",
    password_confirmation: "",
  },
});

const { value: password } = useField<string>("password");
const { value: password_confirmation } = useField<string>(
  "password_confirmation"
);

const onSubmit = handleSubmit(async (values) => {

  if (!token || !email) {
    error.value = "Missing reset token or emiail.";
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    await authService.resetPassword({
      email,
      password: values.password,
      password_confirmation: values.password_confirmation,
      token,
    });

    successMessage.value = "Password reset successful! Redirecting to login...";
    setTimeout(() => {
      router.push(LOGIN);
    }, 800);
  } catch (err) {
    console.error("Reset password failed", err);
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
        <AuthTitle :title="'Reset Password'" />

        <AuthError :authStore="{ error }" />

        <AuthSuccess :successMessage="successMessage" />

        <form @submit.prevent="onSubmit" class="space-y-4 text-left">
          <div class="space-y-2">
            <Label for="password">New Password</Label>
            <Input
              id="password"
              v-model="password"
              class="auth-input"
              type="password"
              placeholder="Enter new password"
              :class="{ 'border-red-500': errors.password }"
              :disabled="isLoading || isSubmitting"
            />
            <ErrorMessage name="password" class="text-sm text-red-600" />
          </div>

          <div class="space-y-2">
            <Label for="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              class="auth-input"
              v-model="password_confirmation"
              type="password"
              placeholder="Confirm new password"
              :class="{ 'border-red-500': errors.password_confirmation }"
              :disabled="isLoading || isSubmitting"
            />
            <ErrorMessage
              name="password_confirmation"
              class="text-sm text-red-600"
            />
          </div>

          <Button type="submit" class="btn px-10 w-full">
            <LoaderIcon
              v-if="isLoading || isSubmitting"
              class="animate-spin -ml-1 mr-3 h-5 w-5"
            />
            {{ isLoading || isSubmitting ? "Resetting..." : "Reset Password" }}
          </Button>
        </form>
      </div>

      <p class="font-primary text-gray-600">
        <router-link
          :to="LOGIN"
          class="text-secondary hover:text-primary font-medium"
        >
          Back to Login
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
