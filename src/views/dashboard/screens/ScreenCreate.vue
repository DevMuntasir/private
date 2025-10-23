<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/composeable/useToast";
import { ScreenConstant } from "@/constant/screen";
import PageLayout from "@/layouts/components/PageLayout.vue";
import { locationService } from "@/services/location-service";
import { screenService } from "@/services/screen-service";

import { ScreenPayload } from "@/types/screen-type";
import { SaveIcon } from "lucide-vue-next";
import { ErrorMessage, useField, useForm } from "vee-validate";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import * as yup from "yup";


const loading = ref(false);
const serverErrors = ref<Record<string, string[]>>({});
const { showToast } = useToast();
const router = useRouter();


const screenSchema = yup.object({
  name: yup.string().required(),
  store_name: yup.string().required(),

  // ✅ single number → number[] (at least one)
  location_id: yup
    .number()
    .typeError("Location must be a number")
    .required()
    .min(1, "Select at least one location")
    .required(),

  store_info: yup
    .object({
      type: yup.string().oneOf(["Fridge", "Shelf", "Other"]).required(),
      system: yup
        .string()
        .oneOf(["SimplePOS", "AdvancedPOS", "Other"])
        .required(),
    })
    .required(),

  screen_info: yup
    .array(
      yup
        .string()
        .oneOf([
          ScreenConstant.SCREEN_INFO_INDOORS,
          ScreenConstant.SCREEN_INFO_OUTDOORS,
          ScreenConstant.SCREEN_INFO_INTERACTIVE,
        ])
    )
    .required(),
  to_t_sc: yup
    .number()
    .typeError("Location must be a number")
    .min(1, "Must be a positive number")
    .required("Total screen time is required!"),
  status: yup.number().oneOf([2, 1]).required(), 
  string_screen_id:yup.string()
});

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

const { handleSubmit, errors, setErrors, resetForm } = useForm<ScreenPayload>({
  validationSchema: screenSchema,
  initialValues: {
    name: "",
    store_name: "",
    location_id: null,
    screen_info: [],
    store_info: {
      type: "Fridge",
      system: "Other",
    },
  },
});

// fields
const { value: name } = useField<string>("name");
const { value: store_name } = useField<string>("store_name");
const { value: location_id } = useField<number[]>("location_id"); // ✅ array
const { value: status } = useField<number>("status");

const { value: store_type } = useField<string>("store_info.type");
const { value: store_system } = useField<string>("store_info.system");
const { value: screen_info } = useField<string[]>("screen_info");
const { value: to_t_sc } = useField<number>("to_t_sc");
const { value: string_screen_id } = useField<number>("string_screen_id");

const typeOptions = ["Fridge", "Shelf", "Other"];
const systemOptions = ["SimplePOS", "AdvancedPOS", "Other"];
const screenInfoOptions = [
  "Indoors",
  "Outdoors",
  "Interactive Display"
];

const locations = ref<Array<{ label: string; value: number }>>([]);

function toFieldErrorMap(errs: Record<string, string[] | string>) {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(errs)) {
    const field = key.split(".")[0]; // e.g. "location_id.0" -> "location_id"
    out[field] = Array.isArray(val) ? String(val[0]) : String(val);
  }
  return out;
}

const onSubmit = handleSubmit(
  async (values) => {
    serverErrors.value = {};
    try {
      loading.value = true;
      const res = await screenService.create(values);
      console.log(res);

      if (res?.success) {
        showToast("Success", res.message, "success");
        router.push("/private/screens");
        resetForm();
      } else if (res?.errors) {
        setErrors(toFieldErrorMap(res.errors));
        if (res.message) serverErrors.value = { _form: [res.message] };
      }
      //eslint-disable-next-line
    } catch (e: any) {
      const data: ApiErrorPayload | undefined = e?.response?.data ?? e?.data;
      const status = e?.response?.status;

      if (data?.errors) {
        setErrors(toFieldErrorMap(data.errors));
      }

      const general =
        data?.message ||
        e?.message ||
        (status === 422 ? "Validation failed." : "Something went wrong.");
      if (general) serverErrors.value = { _form: [general] };
    } finally {
      loading.value = false;
    }
  },
  (clientSideErrors) => {
    console.log(clientSideErrors);
  }
);

onMounted(async () => {
  const res = await locationService.getAllLocation();

  const locationOption = res.data.map((l) => ({
    label: l.name,
    value: l.id,
  }));
  console.log(locationOption);

  locations.value = locationOption;
});


</script>

<template>
  <PageLayout title="New Screen">
    <form @submit.prevent="onSubmit" class="max-w-[600px] mt-5">
      <div class="space-y-4 h-[90%] overflow-y-auto no-scrollbar bg-white p-8">
        <!-- Name -->
        <div>
          <Input
            v-model="name"
            placeholder="Enter screen name"
            class="form-input"
            :class="{ 'border-red-500': errors.name }"
            :disabled="loading"
          />
          <ErrorMessage name="name" class="text-xs text-red-500 mt-1" />
        </div>

          <div>
          <Input
            v-model="string_screen_id"
            placeholder="Enter screen id"
            class="form-input"
            :class="{ 'border-red-500': errors.string_screen_id }"
            :disabled="loading"
          />
          <ErrorMessage name="string_screen_id" class="text-xs text-red-500 mt-1" />
        </div>

        <!-- Store Name -->
        <div>
          <Input
            v-model="store_name"
            placeholder="Enter store name"
            class="form-input"
            :class="{ 'border-red-500': errors.store_name }"
            :disabled="loading"
          />
          <ErrorMessage name="store_name" class="text-xs text-red-500 mt-1" />
        </div>
        <div>
          <Input
            v-model="to_t_sc"
            placeholder="Enter screen time"
            class="form-input"
            :class="{ 'border-red-500': errors.to_t_sc }"
            :disabled="loading"
          />
          <ErrorMessage name="to_t_sc" class="text-xs text-red-500 mt-1" />
        </div>
        <!-- Locations: custom MultiSelect -->
        <div>
          <select
            v-model="location_id"
            class="form-input"
            :class="{
              'border-red-500':
                errors['store_info?.type'] || errors['store_info.type'],
            }"
            :disabled="loading"
          >
            <option disabled value="">Select location</option>
            <option
              v-for="opt in locations"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <ErrorMessage name="location_id" class="text-xs text-red-500 mt-1" />
        </div>

        <!-- Store Info: Type -->
        <div>
          <select
            v-model="store_type"
            class="form-input"
            :class="{
              'border-red-500':
                errors['store_info?.type'] || errors['store_info.type'],
            }"
            :disabled="loading"
          >
            <option disabled value="">Select type</option>
            <option v-for="opt in typeOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
          <ErrorMessage
            name="store_info.type"
            class="text-xs text-red-500 mt-1"
          />
        </div>

        <!-- Store Info: System -->
        <div>
          <select
            v-model="store_system"
            class="form-input"
            :class="{
              'border-red-500':
                errors['store_info?.system'] || errors['store_info.system'],
            }"
            :disabled="loading"
          >
            <option disabled value="">Select system</option>
            <option v-for="opt in systemOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
          <ErrorMessage
            name="store_info.system"
            class="text-xs text-red-500 mt-1"
          />
        </div>

        <!-- Screen Info (checkboxes) -->
        <div>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="opt in screenInfoOptions"
              :key="opt"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :value="opt"
                v-model="screen_info"
                :disabled="loading"
              />
              <span>{{ opt }}</span>
            </label>
          </div>
          <ErrorMessage name="screen_info" class="text-xs text-red-500 mt-1" />
        </div>

        <!-- Status -->
        <div>
          <select
            v-model.number="status"
            class="form-input"
            :class="{ 'border-red-500': errors.status }"
            :disabled="loading"
          >
            <option :value="ScreenConstant.STATUS_ONLINE">Online</option>
            <option :value="ScreenConstant.STATUS_OFFLINE">Offline</option>
          </select>
          <ErrorMessage name="status" class="text-xs text-red-500 mt-1" />
        </div>
      </div>

      <div class="pt-2 flex items-center gap-3">
        <Button type="submit" class="btn" :disabled="loading">
          <SaveIcon /> {{ loading ? "Saving..." : "Save" }}
        </Button>
      </div>
    </form>
  </PageLayout>
</template>
