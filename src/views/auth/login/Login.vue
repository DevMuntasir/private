<script setup >
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuthStore } from "@/store/auth-store";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderIcon
} from "lucide-vue-next";
import { nextTick, onMounted, ref } from "vue";
import {  useRouter } from "vue-router";


import { REDIRECT_AFTER_LOGIN } from "@/constant";

import { useRoleStore } from "@/store/common/role-permission-store";
import { LoginSchema } from "@/types/auth-types";
import { ErrorMessage, useField, useForm } from "vee-validate";
import AuthError from "../components/AuthError.vue";
import AuthLogo from "../components/AuthLogo.vue";
import AuthSideImage from "../components/AuthSideImage.vue";
import AuthSuccess from "../components/AuthSuccess.vue";
import AuthTitle from "../components/AuthTitle.vue";
import Copywrite from "../components/Copywrite.vue";
import { useToast } from "@/composeable/useToast";
import VerifyCode from "../components/VerifyCode.vue";


const router = useRouter();

const authStore = useAuthStore();
const permissionStore = useRoleStore()
const showPassword = ref(false);
const successMessage = ref("");
const showVerify = ref(false);
const { handleSubmit, errors, isSubmitting,setFieldError } = useForm({
  validationSchema: LoginSchema,
  initialValues: {
    email: "",
    password: "",
    rememberMe: false,
  },
});
const otpRef = ref();
const { value: email } = useField("email");
const { value: password } = useField("password");
const {showToast} = useToast()
const onSubmit = handleSubmit(async (values) => {
  try {
  let res =  await authStore.login({
      email: values.email,
      password: values.password,
    });

if (res.data.is_verified === 0) {
   showToast(res.message, '','info')
   showVerify.value = true
         nextTick(() => {
        otpRef.value?.sendOtp(true);
      });
}

if (res.success && res.data.is_verified ===1) {
  successMessage.value = "Login successful! Redirecting...";
  const redirectTo =  REDIRECT_AFTER_LOGIN;
  await permissionStore.fetchSignlePermissions()
  router.push(redirectTo );
}



const backendErrors = res?.error?.response?.data?.errors;
    if (backendErrors) {
      Object.keys(backendErrors).forEach((field) => {
        const messages = backendErrors[field];
        if (messages && messages.length > 0) {
            setFieldError(field , messages[0]);
        }
      });
    }
  
  } catch (error) {
    console.error("Login failed:", error);
  }
});

onMounted(() => {
  authStore.error = null;
  if (authStore.isAuthenticated) {
    router.push(REDIRECT_AFTER_LOGIN);
  }
});
</script>

<template>
  <div
    class="bg-gray-100 flex items-center justify-center min-h-[100dvh] relative"
  >
    <AuthSideImage />
    <div
      class="w-full lg:w-1/2 text-center h-[100dvh] bg-white space-y-5 flex flex-col justify-center items-center relative px-4"
    >
      <div class="space-y-10 max-w-[400px] w-full mx-auto">
        <AuthLogo :title="'Create Account'" />
        <AuthTitle :title="'Login '" />
        <AuthError :authStore="authStore" />
        <AuthSuccess :successMessage="successMessage" />
       <!-- <p> Login your Private-Network Portal</p> -->
        <form @submit.prevent="onSubmit" v-if="!showVerify">
          <div class="space-y-2 text-left">
           
            <Input
              class="auth-input"
              id="email"
              v-model="email"
              type="email"
              placeholder="Email Address"
              :class="{ 'border-red-500': errors.email }"
              :disabled="authStore.isLoading || isSubmitting"
            />
            <ErrorMessage
              name="email"
              class="text-sm text-red-600 text-left inline-block"
            />
          </div>

          <div class="text-left mt-[20px]">
            
            <div class="relative">
              <Input
                class="auth-input"
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                :class="{ 'border-red-500': errors.password }"
                :disabled="authStore.isLoading || isSubmitting"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="authStore.isLoading || isSubmitting"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeOffIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <ErrorMessage
              name="password"
              class="text-sm text-red-600 text-left"
            />
          </div>

          <!-- <div class="flex items-center justify-end mt-[20px]">
            <router-link
              to="/forgot-password"
              class="text-sm text-secondary hover:text-primary "
            >
              Forgot password?
            </router-link>
          </div> -->

          <Button type="submit" class="btn mt-[35px] text-[16px] px-[77px] h-[50px]">
            <LoaderIcon
              v-if="authStore.isLoading || isSubmitting"
              class="animate-spin -ml-1 mr-3 h-5 w-5"
            />
            {{
              authStore.isLoading || isSubmitting ? "Login..." : "Login"
            }}
          </Button>
        </form>
         <VerifyCode ref="otpRef" v-if="showVerify" />
      </div>



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

.auth-input {
  transition: all 0.2s ease-in-out;
}

.auth-input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
</style>
