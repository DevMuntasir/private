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
import { useRoute, useRouter } from "vue-router";
import * as yup from "yup";
const loading = ref(false);
const serverErrors = ref<Record<string, string[]>>({});
const { showToast } = useToast();
const router = useRouter();
const route = useRoute();
const locations = ref<Array<{ label: string; value: number }>>([]);
const screenSchema = yup.object({
  name: yup.string().required(),
  store_name: yup.string().required(),
  location_id: yup.number().required(),
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
  status: yup.number().oneOf([0, 1]).required(),
  to_t_sc: yup.number().required("Total screen time is required!"),
});

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

const { handleSubmit, errors, setErrors, resetForm, setValues } =
  useForm<ScreenPayload>({
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
      to_t_sc: null,
    },
  });

onMounted(async () => {
  const res = await screenService.getScreenDetails(
    Number(route.params.screenId)
  );

  const screenInfoStrings = (res.data.screen_info ?? [])
    //eslint-disable-next-line
    .map((x: any) => {
      if (typeof x === "object" && x !== null) {
        return String(x.value ?? x.label ?? "");
      }
      return String(x ?? "");
    })
    .map((s: string) =>
      s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s
    )
    .filter(Boolean);

  setValues({
    name: res.data.name,
    store_name: res.data.store_name,
    location_id: res.data.location.id,
    status: res.data.status.value,
    to_t_sc: res.data.to_t_sc,
    m_co_s: res.data.m_co_s ,
    a_to_t: res.data.a_to_t ,
    screen_info: screenInfoStrings, 
    store_info: {
      type: res.data.store_info?.type ?? "Fridge",
      system: res.data.store_info?.system ?? "Other",
    },
  });
});


const { value: name } = useField<string>("name");
const { value: store_name } = useField<string>("store_name");
const { value: location_id } = useField<number>("location_id");
const { value: status } = useField<number>("status");

const { value: store_type } = useField<string>("store_info.type");
const { value: store_system } = useField<string>("store_info.system");
const { value: screen_info } = useField<string[]>("screen_info");
const { value: to_t_sc } = useField<number>("to_t_sc");
const { value: m_co_s } = useField<number>("m_co_s");
const { value: a_to_t } = useField<number>("a_to_t");
const typeOptions = ["Fridge", "Shelf", "Other"];
const systemOptions = ["SimplePOS", "AdvancedPOS", "Other"];
const screenInfoOptions = ["Indoors", "Outdoors", "Interactive Display"];
function toFieldErrorMap(errs: Record<string, string[] | string>) {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(errs)) {
    const field = key.split(".")[0];
    out[field] = Array.isArray(val) ? String(val[0]) : String(val);
  }
  return out;
}
const onSubmit = handleSubmit(
  async (values) => {
    serverErrors.value = {};
    try {
      loading.value = true;
      const res = await screenService.update(
        Number(route.params.screenId),
        values
      );

      if (res?.success) {
        showToast("Success", res.message, "success");
        router.push("/admin/screens");
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
  locations.value = locationOption;
});
</script>

<template>
  <PageLayout title="Edit Screen">
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
        <div>
          <Input
          readonly
            v-model="m_co_s"
            placeholder="Most cost screen"
            class="form-input"
            :class="{ 'border-red-500': errors.m_co_s }"
            :disabled="loading"
          />
          <ErrorMessage name="m_co_s" class="text-xs text-red-500 mt-1" />
        </div>
        <div>
          <Input
          readonly
            v-model="a_to_t"
            placeholder="Total screen time"
            class="form-input"
            :class="{ 'border-red-500': errors.a_to_t }"
            :disabled="loading"
          />
          <ErrorMessage name="a_to_t" class="text-xs text-red-500 mt-1" />
        </div>
        <!-- Location ID -->
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
