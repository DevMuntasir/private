import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { authService } from "@/services/auth-service";
import type { Login, LoginResponse, Registration } from "@/types/auth-types";
import { useRouter } from "vue-router";

import { ApiResponse } from "@/types/common";
import { appConfig } from "@/config/app.config";
import { OTP_STORAGE_KEY, OTP_VALIDITY_MS } from "@/constant/auth";

export interface PendingOtpState {
  email: string;
  expiresAt: number;
}

export function loadPendingOtpFromStorage(): PendingOtpState | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const stored = localStorage.getItem(OTP_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<PendingOtpState>;

    if (!parsed.email || !parsed.expiresAt) {
      localStorage.removeItem(OTP_STORAGE_KEY);
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(OTP_STORAGE_KEY);
      return null;
    }

    return {
      email: parsed.email,
      expiresAt: parsed.expiresAt,
    };
  } catch (error) {
    console.warn("Failed to read pending OTP state:", error);
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();

  const token = ref<string | null>(loadToken());
  const refreshToken = ref<string | null>(loadRefreshToken());
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isAdmin = ref<boolean>(
    JSON.parse(localStorage.getItem("isAdmin") ?? "false")
  );
  const stepper_count = ref<number>(loadStepperCount());
  const is_stepper_complete = ref<number>(loadStepperComplete());

  const isAuthenticated = computed(() => !!token.value);
  const existingPendingOtp = loadPendingOtpFromStorage();
  const email = ref<string | null>(existingPendingOtp?.email ?? null);
  const is_verified = ref<boolean>(loadIsVerified());
  function persistPendingOtpState(emailValue: string): void {
    if (!emailValue || typeof window === "undefined" || !window.localStorage) {
      return;
    }

    try {
      const state: PendingOtpState = {
        email: emailValue,
        expiresAt: Date.now() + OTP_VALIDITY_MS,
      };
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(state));
      email.value = emailValue;
    } catch (error) {
      console.warn("Failed to persist pending OTP state:", error);
    }
  }

  function clearPendingOtpState(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.removeItem(OTP_STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to clear pending OTP state:", error);
      }
    }

    email.value = null;
  }

  async function login(
    credentials: Login
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.login(credentials);
      is_verified.value = response.data.is_verified === 1;
      try {
        localStorage.setItem("is_verified", JSON.stringify(is_verified.value));
      } catch {}

      if (!is_verified.value) {
        token.value = null;
        refreshToken.value = null;
        syncStepperState(0, 0);
        try {
          localStorage.removeItem(appConfig.tokenKey);
          localStorage.removeItem(appConfig.refreshTokenKey);
          localStorage.removeItem("stepper_count");
          localStorage.removeItem("is_stepper_complete");
          localStorage.removeItem("isAdmin");
        } catch {}
        persistPendingOtpState(credentials.email);
        return response;
      }
      isAdmin.value = response.data.is_admin == 1 ? true : false;
      syncStepperState(
        response.data.stepper_count ?? 0,
        response.data.is_stepper_complete ?? 0
      );
      token.value = response.data.access_token;
      localStorage.setItem(appConfig.tokenKey, response.data.access_token);
      try {
        localStorage.setItem("isAdmin", JSON.stringify(isAdmin.value));
        localStorage.setItem("is_verified", JSON.stringify(is_verified.value));
      } catch {}
      return response;
    } catch (err: any) {
      error.value = err?.response?.data?.message || "Login failed";
      return {
        success: false,
        message: "Registration failed",
        error: err,
        data: null,
        status: 422,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function register(
    payload: Registration
  ): Promise<ApiResponse<Registration>> {
    try {
      isLoading.value = true;
      error.value = null;
      const res = await authService.register(payload);
      if (res.success) {
        persistPendingOtpState(payload.email);
      }
      return res;
    } catch (err: any) {
      error.value = err?.response?.data?.message || "Registration failed";

      return {
        success: false,
        message: "Registration failed",
        error: err,
        data: null,
        status: 422,
      };
    } finally {
      isLoading.value = false;
    }
  }
  async function resendOtp(emailValue: string | null): Promise<void> {
    const targetEmail = emailValue ?? email.value;

    if (!targetEmail) {
      error.value = "Missing email for OTP resend";
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      await authService.resendOtp(targetEmail);
      persistPendingOtpState(targetEmail);
    } catch (err: any) {
      error.value = err?.response?.data?.message || "Failed to resend OTP";
    } finally {
      isLoading.value = false;
    }
  }
  async function verifyOtp(otp: number): Promise<void> {
    const emailValue = email.value;

    if (!emailValue) {
      error.value = "Missing email for OTP verification";
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      await authService.verifyOtp(otp, emailValue);
      clearPendingOtpState();
      logout();
    } catch (err: any) {
      error.value = err?.response?.data?.message || "Failed to verify OTP";
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      isLoading.value = true;
      await authService.logout();
    } catch (err) {
      console.warn("Logout API call failed:", err);
    } finally {
      token.value = null;
      refreshToken.value = null;
      error.value = null;
      isLoading.value = false;
      syncStepperState(0, 0);
      is_verified.value = false;

      clearPendingOtpState();
      localStorage.removeItem(appConfig.tokenKey);
      localStorage.removeItem(appConfig.refreshTokenKey);
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("stepper_count");
      localStorage.removeItem("is_stepper_complete");
      localStorage.removeItem("is_verified");
      router.push("/");
    }
  }

  function clearError(): void {
    error.value = null;
  }

  function loadToken(): string | null {
    return localStorage.getItem(appConfig.tokenKey);
  }

  function loadRefreshToken(): string | null {
    return localStorage.getItem(appConfig.refreshTokenKey);
  }

  function loadIsVerified(): boolean {
    const raw = localStorage.getItem("is_verified");
    if (raw === null) {
      return false;
    }
    if (raw === "true" || raw === "1") {
      return true;
    }
    if (raw === "false" || raw === "0") {
      return false;
    }
    try {
      const parsed = JSON.parse(raw);
      return Boolean(parsed);
    } catch {
      return false;
    }
  }

  function loadStepperCount(): number {
    const raw = localStorage.getItem("stepper_count");
    const parsed = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function loadStepperComplete(): number {
    const raw = localStorage.getItem("is_stepper_complete");
    const parsed = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function syncStepperState(count: number, complete: number): void {
    const normalizedCount = Number.isFinite(count) ? count : 0;
    const normalizedComplete = Number.isFinite(complete) ? complete : 0;
    stepper_count.value = normalizedCount;
    is_stepper_complete.value = normalizedComplete;
    try {
      localStorage.setItem(
        "stepper_count",
        JSON.stringify(stepper_count.value)
      );
      localStorage.setItem(
        "is_stepper_complete",
        JSON.stringify(is_stepper_complete.value)
      );
    } catch {}
  }

  function markStepperComplete(): void {
    const nextCount = Math.max(
      Number.isFinite(stepper_count.value) ? stepper_count.value : 0,
      1
    );
    syncStepperState(nextCount, 1);
  }

  return {
    token,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    isAdmin,
    resendOtp,
    email,
    verifyOtp,
    stepper_count,
    is_stepper_complete,
    is_verified,
    syncStepperState,
    markStepperComplete,
  };
});
