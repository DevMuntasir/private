<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBillingStore } from "@/store/client/client-billing-store";
import { ChevronDownIcon, Loader, PlusIcon } from "lucide-vue-next";
import { Field, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import * as yup from "yup";

defineEmits(["close"]);
const isEdit = computed(() =>
  billingStore.paymentProfile?.id && billingStore.billingProfile?.id
    ? true
    : false
);
const billingStore = useBillingStore();
const route = useRoute();

console.log(billingStore.billingProfile);

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

// existing image from server
const initialImageUrl = ref(billingStore.paymentProfile?.image ?? null);

// image to show (either selected or existing)
const showImage = computed(() =>
  selectedFile.value
    ? URL.createObjectURL(selectedFile.value)
    : initialImageUrl.value
);

const triggerFileUpload = () => fileInput.value?.click();
const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) selectedFile.value = file;
};
const removeImage = () => {
  selectedFile.value = null;
  initialImageUrl.value = null;
};

const billingEmails = ref<string[]>(
  Array.isArray(billingStore.billingProfile?.email)
    ? [...billingStore.billingProfile?.email]
    : []
);
const newEmail = ref("");
const emailInputRef = ref<HTMLInputElement | null>(null);
const emailError = ref("");

function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}
function addEmail(event?: Event | KeyboardEvent) {
  const trimmed = newEmail.value.trim();
  if (!trimmed) return;

  if (isValidEmail(trimmed)) {
    if (!billingEmails.value.includes(trimmed)) {
      billingEmails.value.push(trimmed);
    }
    newEmail.value = "";
    emailError.value = "";
  } else {
    emailError.value = "Invalid email format";
  }

  if (event instanceof KeyboardEvent && event.key === ",") {
    event.preventDefault();
  }
}
function removeEmail(index: number) {
  billingEmails.value.splice(index, 1);
}

const schema = yup.object({
  legalName: yup.string().nullable(),
  streetAddress: yup.string().nullable(),
  aptSuite: yup.string().nullable(),
  cityDistrict: yup.string().required("City/district is required"),
  province: yup.number().required("Province is required"),
  postalCode: yup.string().nullable(),
  billingContactName: yup.string().required("Billing contact name is required"),
  billingContactPhone: yup.string().required("Billing phone is required"),
});

const initialValues = {
  legalName: billingStore.paymentProfile?.legal_name || "",
  streetAddress: billingStore.paymentProfile?.street_address || "",
  aptSuite: billingStore.paymentProfile?.detail_address || "",
  cityDistrict: billingStore.paymentProfile?.city_district || "",
  province: billingStore.paymentProfile?.province || 1,
  postalCode: billingStore.paymentProfile?.postal_code || 1,
  billingContactName: billingStore.billingProfile?.contact_name || 1,
  billingContactPhone: billingStore.billingProfile?.phone || " 1",
};

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues,
});
console.log(route);

const onSubmit = handleSubmit(
  async (values) => {
    try {
      const formData = new FormData();
      formData.append("legal_name", values.legalName || "");
      formData.append("street_address", values.streetAddress || "");
      formData.append("detail_address", values.aptSuite || "");
      formData.append("city_district", values.cityDistrict || "");
      formData.append("province", String(values.province || ""));
      formData.append("postal_code", String(values.postalCode) || "");

      if (selectedFile.value) {
        formData.append("image", selectedFile.value);
      }

      if (!selectedFile.value && !initialImageUrl.value) {
        formData.append("remove_image", "1"); // Optional: backend must support this
      }

      const paymentSettingId = Number(billingStore.paymentSettings.id);
      formData.append("payment_setting_id", `${paymentSettingId}`);
      formData.append("contact_name", values.billingContactName || "");
      formData.append("phone", values.billingContactPhone || "");

      billingEmails.value.forEach((email) => {
        formData.append("email[]", email.trim());
      });

      if (route.params.mode != "create") {
        await billingStore.updatePaymentProfile(formData);
      } else {
        await billingStore.createPaymentProfile(formData);
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  },
  (errors) => {
    console.log("Validation Errors:", errors);
  }
);
</script>

<template>
  <ScrollArea class="max-h-[90vh] w-full mx-auto bg-white overflow-hidden">
    <form @submit="onSubmit" class="m-2 space-y-6">
      <div>
        <h2 class="text-[20px] font-primary">Create payment profile</h2>
        <p class="text-sm text-gray-500">
          If you signing for business, choose Organization. Otherwise choose
          Individual.
        </p>
      </div>
<div class=" space-y-3">
        <Field
        name="legalName"
        as="input"
        placeholder="Legal Name"
        class="form-input"
      />
      <Field
        name="streetAddress"
        as="input"
        placeholder="Street Address"
        class="form-input"
      />
      <Field
        name="aptSuite"
        as="input"
        placeholder="Apt, suite, building, etc. (optional)"
        class="form-input"
      />
      <div class="relative">
        <Field as="select" name="cityDistrict" class="form-input">
          <option disabled value="">City/district</option>
          <option value="dhaka">Dhaka</option>
          <option value="chittagong">Chittagong</option>
          <option value="sylhet">Sylhet</option>
          <option value="rajshahi">Rajshahi</option>
        </Field>
        <ChevronDownIcon
          class="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="relative">
          <Field as="select" name="province" class="form-input">
            <option disabled value="">Province</option>
            <option :value="1">Dhaka Division</option>
          </Field>
          <ChevronDownIcon
            class="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none"
          />
        </div>
        <div>
          <Field
            name="postalCode"
            as="input"
            placeholder="Postal code"
            class="form-input"
          />
        </div>
      </div>

      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-2"
      >
        <div class="flex items-center gap-4">
          <Button type="button" class="btn" @click="triggerFileUpload">
            <PlusIcon class="w-4 h-4 mr-1" /> Upload Image
          </Button>
          <span class="text-sm text-gray-500"
            >Attach ID card/passport photo</span
          >
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />

        <div v-if="showImage" class="relative w-32 h-32 mt-2">
          <img
            :src="showImage"
            class="w-full h-full object-cover rounded-md border"
          />
          <button
            type="button"
            @click="removeImage"
            class="absolute top-1 right-1 bg-white rounded-full shadow px-1 text-sm text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>

        <p v-else class="text-sm text-gray-400">No image selected</p>
      </div>
</div>

      <!-- Billing Section -->
      <div class="space-y-4 pt-6">
        <h2 class="text-lg font-medium text-gray-900">
          Billing Profile<span class="text-red-500">*</span>
        </h2>
        
        <Field
          name="billingContactName"
          as="input"
          placeholder="Billing Contact Name*"
          class="form-input"
        />
       

        <Field
          name="billingContactPhone"
          as="input"
          type="tel"
          placeholder="Billing Phone Number*"
          class="form-input"
        />
        <!-- Billing Emails Input (Gmail-style) -->
        <div class="space-y-1">
          

          <div
            class="border-[1px] font-primary p-3 !max-h-[100px] flex flex-wrap gap-2 items-center"
            @click="emailInputRef?.focus()"
          >
            <span
              v-for="(email, index) in billingEmails"
              :key="index"
              class="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded flex items-center gap-1"
            >
              {{ email }}
              <button
                type="button"
                @click="removeEmail(index)"
                class="text-blue-500 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            </span>

            <input
              ref="emailInputRef"
              v-model="newEmail"
              @keydown.enter.prevent="addEmail"
              @keydown="
                (e) => {
                  if (e.key === ',') addEmail(e);
                }
              "
              @blur="addEmail"
              type="email"
              placeholder="Type email and press Enter..."
              class="flex-1 outline-none text-sm min-w-[120px]"
            />
            
          </div>
          <span class=" text-[12px] text-gray-500">(Add more than 1 separated with press Enter)</span>
          <p v-if="emailError" class="text-red-500 text-xs mt-1">
            {{ emailError }}
          </p>
        </div>
      </div>

      <!-- Buttons -->

      <Button class="btn" type="submit" :disabled="billingStore.isLoading">
        <Loader v-if="billingStore.isLoading"></Loader>
        {{ isEdit ? "Update" : "Save changes" }}
      </Button>
    </form>
  </ScrollArea>
</template>
