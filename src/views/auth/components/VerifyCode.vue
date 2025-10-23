<template>
  <div class="space-y-6 w-full px-6">
    <div
      v-if="showDestinationNotice"
      class="rounded-md bg-muted/40 px-3 py-2 text-center text-sm text-muted-foreground"
    >
      We sent a 6-digit code to
      <span class="font-semibold text-foreground">{{ destinationLabel }}</span>.
      Please enter it below.
    </div>

    <!-- OTP Inputs -->
    <form @submit.prevent="verifyOtp" class="space-y-6">
      <div class="flex justify-center gap-2">
        <input
          v-for="i in 6"
          :key="i"
          :ref="(el) => el && (otpInputs[i - 1] = el as HTMLInputElement)"
          v-model="otp[i - 1]"
          maxlength="1"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          class="h-12 w-12 border border-gray-300 text-center text-lg font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-primary"
          @input="handleInput(i - 1, $event)"
          @keydown.backspace="handleBackspace(i - 1)"
          @paste="handlePaste"
          :aria-label="`OTP digit ${i}`"
        />
      </div>

      <Button type="submit" class="btn w-full" :disabled="buttonDisabled">
        {{ authStore.isLoading ? "Verifying" : "Verify" }}
      </Button>
    </form>

    <!-- Resend Timer -->
    <div
      class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 font-secondary-Regular"
    >
      Didn't receive the code?
      <button
        class="font-medium text-secondary hover:underline cursor-pointer ml-1"
        :disabled="resendDisabled || isSendingOtp"
        @click="handleResendOtp"
      >
        {{
          resendDisabled
            ? `Resend in ${timer}s`
            : isSendingOtp
            ? "Sending..."
            : "Resend OTP"
        }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import Button from "@/components/ui/button/Button.vue";
import { useAuthStore } from "@/store/auth-store";
import { OTP_VALIDITY_SECONDS } from "@/constant/auth";
import { useToast } from "@/composeable/useToast";

const authStore = useAuthStore();
const { showToast } = useToast();

const otp = ref<string[]>(Array(6).fill(""));
const otpInputs = ref<HTMLInputElement[]>([]);
const otpCode = computed(() => otp.value.join(""));
const isOtpComplete = computed(() => otp.value.every((d) => d.length === 1));

const timer = ref(0);
const resendDisabled = ref(false);
const isSendingOtp = ref(false);
const hasDispatchedOtp = ref(false);
let interval: ReturnType<typeof setInterval> | null = null;

const destinationLabel = computed(() => {
  const value = authStore.email ?? "";
  if (!value) {
    return "";
  }

  if (value.includes("@")) {
    const [user, domain] = value.split("@");
    if (!domain) {
      return value;
    }
    if (!user) {
      return `*@${domain}`;
    }
    if (user.length <= 2) {
      return `${user.charAt(0)}***@${domain}`;
    }
    const masked = `${user.charAt(0)}${"*".repeat(Math.max(1, user.length - 2))}${user.charAt(user.length - 1)}`;
    return `${masked}@${domain}`;
  }

  if (/^\d{6,}$/.test(value)) {
    const visibleStart = value.slice(0, 3);
    const visibleEnd = value.slice(-2);
    return `${visibleStart}${"*".repeat(Math.max(1, value.length - 5))}${visibleEnd}`;
  }

  return value;
});

const showDestinationNotice = computed(
  () => Boolean(destinationLabel.value) && (hasDispatchedOtp.value || isSendingOtp.value)
);

const buttonDisabled = computed(
  () => !isOtpComplete.value || authStore.isLoading
);

const startCountdown = (initialSeconds: number = OTP_VALIDITY_SECONDS) => {
  const sanitized = Math.max(0, Math.floor(initialSeconds));

  timer.value = sanitized;
  resendDisabled.value = sanitized > 0;
  if (sanitized > 0) {
    hasDispatchedOtp.value = true;
  }

  if (interval) {
    clearInterval(interval);
  }

  if (sanitized === 0) {
    resendDisabled.value = false;
    return;
  }

  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(interval!);
      resendDisabled.value = false;
    }
  }, 1000);
};

const focusFirstInput = () => {
  nextTick(() => {
    otpInputs.value[0]?.focus();
  });
};

const resetOtp = () => {
  otp.value = Array(6).fill("");
  focusFirstInput();
};

const sendOtp = async (force = false) => {
  if (!authStore.email) {
    showToast(
      "Unable to send OTP",
      "Missing email address for verification.",
      "error"
    );
    return;
  }

  if (!force && (resendDisabled.value || isSendingOtp.value)) {
    return;
  }

  try {
    isSendingOtp.value = true;
    await authStore.resendOtp(authStore.email);
    resetOtp();
    startCountdown();
    const label = destinationLabel.value;
    const detail = label
      ? `We sent a code to ${label}.`
      : "We sent the verification code to your contact.";
    const resendDetail = label
      ? `A new code was sent to ${label}.`
      : "A new verification code was sent.";

    showToast(
      force ? "Verification code sent" : "New code sent",
      force ? detail : resendDetail,
      force ? "info" : "success"
    );
    hasDispatchedOtp.value = true;
  } catch (error) {
    console.error("Failed to resend OTP:", error);
    resendDisabled.value = false;
    showToast(
      "Unable to send code",
      "Please try again in a moment.",
      "error"
    );
  } finally {
    isSendingOtp.value = false;
  }
};

defineExpose({
  otpCode,
  startCountdown,
  sendOtp,
});

const verifyOtp = async () => {
  if (!isOtpComplete.value) {
    showToast("Incomplete code", "Please enter all 6 digits.", "error");
    return;
  }

  try {
    await authStore.verifyOtp(Number.parseInt(otpCode.value, 10));
    showToast("Success", "OTP verified successfully!", "success");
  } catch (error) {
    console.error("OTP verification failed:", error);
    showToast("Failed", "OTP verification failed!", "error");
  }
};

const handleResendOtp = () => {
  void sendOtp(false);
};

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  if (value.length > 1) {
    value = value.charAt(0);
    input.value = value;
  }

  otp.value[index] = value;

  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  } else if (!value && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const handleBackspace = (index: number) => {
  if (otp.value[index] === "" && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const paste = event.clipboardData?.getData("text").trim();
  if (paste && /^\d{6}$/.test(paste)) {
    for (let i = 0; i < 6; i++) otp.value[i] = paste[i];
    otpInputs.value[5]?.focus();
  }
};

onMounted(() => {
  focusFirstInput();
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>
