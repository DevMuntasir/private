<template>

  <Card class="rounded-sm max-w-[500px] mt-4">
    <CardHeader>
      <CardTitle class="text-[22px]">Reset Password</CardTitle>
      <CardDescription>
        Change your password. You'll be logged out after saving.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Current password -->
      <div class="space-y-1">
        <Label for="current">Current password</Label>
        <div class="relative">
          <Input
            id="current"
            :type="showCurrentPassword ? 'text' : 'password'"
            v-model="currentPassword"
            class="form-input mt-2 pr-10"
            placeholder="Current password."
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            <Eye v-if="!showCurrentPassword" class="h-4 w-4" />
            <EyeOff v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- New password -->
      <div class="space-y-1">
        <Label for="new">New password</Label>
        <div class="relative">
          <Input
            id="new"
            :type="showNewPassword ? 'text' : 'password'"
            v-model="newPassword"
            class="form-input mt-2 pr-10"
            placeholder="New password."
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            @click="showNewPassword = !showNewPassword"
          >
            <Eye v-if="!showNewPassword" class="h-4 w-4" />
            <EyeOff v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Confirm password -->
      <div class="space-y-1">
        <Label for="confirm">Confirm new password</Label>
        <div class="relative">
          <Input
            id="confirm"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            class="form-input mt-2 pr-10"
            placeholder="Confirm new password."
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
            <EyeOff v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button class="btn" @click="handlePasswordReset" :disabled="resetting">
        <LoaderIcon
          v-if="resetting"
          class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
        />
        {{ resetting ? "Saving..." : "Save password" }}
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/composeable/useToast";
import { authService } from "@/services/auth-service";

import { User } from "@/types/user-types";
import { Eye, EyeOff, LoaderIcon } from "lucide-vue-next";


import { ref } from "vue";
import { useUserStore } from "@/store/user-store";
const { showToast } = useToast();
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const resetting = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const userInfo = ref<User | null>(null);
const adminUserStore = useUserStore();
const handlePasswordReset = async () => {
  if (!userInfo.value) return;

  if (newPassword.value !== confirmPassword.value) {
    showToast("Password not matched!", "", "info");
    return;
  }

  try {
    resetting.value = true;
    const res = await authService.authResetPassword(
      adminUserStore.authUser.data.id,
      {
        password: newPassword.value,
        password_confirmation: confirmPassword.value,
      }
    );

    if (res.success) {
      showToast(
        "Password changed successfully",
        "You will be logged out shortly.",
        "success"
      );
    } else {
      showToast("Reset failed", res.message || "Please try again.", "error");
    }
  } catch (error) {
    console.error(error);
    showToast(error.response.data.message, "Something went wrong", "error");
  } finally {
    resetting.value = false;
  }
};
</script>
