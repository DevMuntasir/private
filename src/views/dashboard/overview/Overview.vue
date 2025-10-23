<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { LoaderIcon } from "lucide-vue-next";
import * as yup from "yup";
import { ErrorMessage, useField, useForm } from "vee-validate";

import PageLayout from "@/layouts/components/PageLayout.vue";
import OverviewCards from "./OverviewCards.vue";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { clientService } from "@/services/client-service";
import { useToast } from "@/composeable/useToast";

const authStore = useAuthStore();
const { showToast } = useToast();

const modalOpen = ref(false);
const isPrefetching = ref(false);
const isSaving = ref(false);
// const hasPrefetched = ref(false);

const schema = yup.object({
  businessName: yup
    .string()
    .trim()
    .max(255, "Business name must be 255 characters or fewer.")
    .required("Business name is required."),
});

const { handleSubmit, setFieldValue,setFieldError } = useForm<{ businessName: string }>({
  validationSchema: schema,
  initialValues: {
    businessName: "",
  },
});

const { value: businessName } = useField<string>("businessName");

const shouldForceModal = computed(
  () =>
    authStore.isAuthenticated &&
    authStore.is_verified &&
    Number(authStore.is_stepper_complete ?? 0) === 0 && authStore.isAdmin
);

const disableSubmit = computed(() => {
  const value = businessName.value ?? "";
  return (
    isPrefetching.value ||
    isSaving.value ||
    value.trim().length === 0
  );
});

watch(shouldForceModal,
  async (shouldOpen) => {
    if (shouldOpen) {
      modalOpen.value = true;
      // if (!hasPrefetched.value) {
      //   await loadBusinessSnapshot();
      // }
    } else {
      modalOpen.value = false;
    }
  },
  { immediate: true }
);

function handleOpenChange(nextOpen: boolean) {
  if (shouldForceModal.value) {
    modalOpen.value = true;
    return;
  }

  modalOpen.value = nextOpen;
}

// async function loadBusinessSnapshot() {
//   if (isPrefetching.value) {
//     return;
//   }

//   isPrefetching.value = true;
//   try {
//     const response = await clientService.fetchStepperSnapshot();
// console.log(response);

//     if (response.success && response.data) {
//       const snapshot = response.data;
//       setFieldValue("businessName", snapshot?.client?.name ?? "", false);

//       authStore.syncStepperState(
//         snapshot?.stepper_count ?? 0,
//         snapshot?.is_stepper_complete ?? 0
//       );
//     } else {
//       showToast(
//         "Unable to load",
//         response.message || "Failed to load business details.",
//         "error"
//       );
//     }
//   } catch (error: any) {
//     console.log(error);
    
//     setFieldError('businessName',error?.response?.data?.message)
//     const message =
//       error?.response?.data?.message ??
//       error?.message ??
//       "Failed to load business details.";
//     showToast("Unable to load", message, "error");
//   } finally {
//     hasPrefetched.value = true;
//     isPrefetching.value = false;
//   }
// }

const submitBusiness = handleSubmit(async ({ businessName }) => {
  const formattedName = businessName.trim();
  if (!formattedName) {
    return;
  }

  try {
    isSaving.value = true;
    const response = await clientService.submitBusinessProfile({
      name: formattedName,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to save business name.");
    }

    authStore.markStepperComplete();
    showToast("Success", "Business name saved successfully.", "success");
    modalOpen.value = false;
    setFieldValue("businessName", formattedName, false);
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Failed to save business name.";
      setFieldError("businessName", message);
  } finally {
    isSaving.value = false;
  }
});
</script>

<template>
  <PageLayout title="Overview">
    <OverviewCards />
  </PageLayout>

  <AlertDialog :open="modalOpen" @update:open="handleOpenChange">
    <AlertDialogContent class="sm:max-w-md">
      <form class="space-y-6" @submit.prevent="submitBusiness">
        <AlertDialogHeader class="">
          <AlertDialogTitle class="text-2xl font-semibold font-primary">
            Complete your business profile
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tell us your business name to finish setting up your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div class="space-y-2">
          <Label class="text-sm font-medium" for="business-name">
            Business name
          </Label>
          <Input
            id="business-name"
            class=" form-input"
            v-model="businessName"
            placeholder="Enter your registered business name"
            :disabled="isPrefetching || isSaving"
          />
          <ErrorMessage
            name="businessName"
            class="text-xs text-red-500"
          />
          <!-- <p class="text-xs text-muted-foreground">
            We'll use this across your dashboard and invoices.
          </p> -->
        </div>

        <AlertDialogFooter>
          <Button type="submit" class="btn w-full" :disabled="disableSubmit">
            <LoaderIcon
              v-if="isSaving || isPrefetching"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Save &amp; Continue
          </Button>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  </AlertDialog>
</template>
