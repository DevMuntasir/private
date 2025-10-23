<template>
  <div class="min-h-[calc(100vh-72px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
      <!-- Icon -->
      <div class="flex justify-center mb-6">
        <div class="bg-red-100 rounded-full p-4">
          <ShieldXIcon class="h-12 w-12 text-red-600" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
        <p class="text-gray-600 text-lg mb-2">
          User has not permission to visit this page
        </p>
        <p class="text-sm text-gray-500">
          You don't have the required permissions to access this resource. Please contact your administrator if you believe this is an error.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="goHome"
          class="w-full bg-secondary hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <HomeIcon class="h-5 w-5 mr-2" />
          Go to Homepage
        </button>

        <button
          @click="goBack"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          Go Back
        </button>

        <button
          @click="contactSupport"
          class="w-full text-secondary hover:text-secondary font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <MailIcon class="h-5 w-5 mr-2" />
          Contact Support
        </button>
      </div>

      <!-- Error Details -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Error Code: 403</span>
          <span>{{ currentTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShieldXIcon, HomeIcon, ArrowLeftIcon, MailIcon } from 'lucide-vue-next'

const currentTime = ref('')

const goHome = () => {
  // Navigate to homepage
  window.location.href = '/'
}

const goBack = () => {
  // Go back to previous page
  window.history.back()
}

const contactSupport = () => {
  // Open email client or navigate to support page
  window.location.href = 'mailto:support@example.com?subject=Access Permission Request'
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString()
}

onMounted(() => {
  updateTime()
})
</script>

<style scoped>
/* Additional custom styles if needed */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>