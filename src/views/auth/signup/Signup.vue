<!-- pages/client/Register.vue -->
<script setup lang="ts">

import { LOGIN } from "@/constant";

// import ClientRegistrationForm from "../../components/ClientRegistrationForm.vue";
import AuthLogo from "../components/AuthLogo.vue";
import RegistrationForm from "../components/RegistrationForm.vue";


</script>

<template>
  <div class="flex min-h-[100dvh]">
    <!-- LEFT IMAGE -->
    <div class="hidden lg:block lg:w-1/2">
      <img
        src="/auth/bg.png"
        alt="Background image"
        class="fixed top-0 left-0 w-1/2 h-screen object-cover"
      />
    </div>

    <!-- RIGHT FORM -->
    <div class="w-full lg:w-1/2 h-[100dvh] overflow-y-auto bg-white p-6 no-scrollbar content-center">
      <div class="max-w-[400px] w-full mx-auto py-10 space-y-8">
        <AuthLogo />
       
        <RegistrationForm
          :redirectTo="LOGIN"
          submitLabel="Register"
          :showVerifyCode="true"
        />
    
        <p class="text-[#231F20] text-center font-secondary">
          Already have an account?
          <router-link
            :to="LOGIN"
            class="text-secondary hover:text-primary"
          >
            Login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
