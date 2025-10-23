<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- 404 Number -->
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-slate-200 select-none">404</h1>
        <div class="relative -mt-8">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33m0 0L3.34 15.25M20.66 15.25l-2.58-2.58M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-2">Page Not Found</h2>
        <p class="text-slate-600 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <button 
          @click="goHome"
          class="w-full bg-secondary hover:bg-primary text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Go Home
        </button>
        
        <button 
          @click="goBack"
          class="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-6 rounded-lg border border-slate-200 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Go Back
        </button>
      </div>

      <!-- Help Text -->
      <div class="mt-8 pt-8 border-t border-slate-200">
        <p class="text-sm text-slate-500">
          Need help? 
          <a href="mailto:support@example.com" class="text-secondary hover:text-slate-900 font-medium underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute top-10 left-10 w-20 h-20 bg-slate-200 rounded-full opacity-50"></div>
    <div class="absolute bottom-10 right-10 w-32 h-32 bg-slate-200 rounded-full opacity-30"></div>
    <div class="absolute top-1/2 left-4 w-16 h-16 bg-slate-200 rounded-full opacity-40"></div>
  </div>
</template>

<script setup>


// If using Vue Router, uncomment the line below
// const router = useRouter()

const goHome = () => {
  // If using Vue Router:
  // router.push('/')
  
  // For simple navigation:
  window.location.href = '/'
}

const goBack = () => {
  // Go back to previous page
  window.history.back()
}
</script>

<style scoped>
/* Additional custom styles if needed */
.select-none {
  user-select: none;
}
</style>