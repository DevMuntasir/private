<template>
  <div class="px-6 py-4 bg-gray-50 border-b-[1px]">
    <h1 class="text-[18px] flex items-center gap-2 font-semibold">
      <User2 /> {{ isEdit ? "Update User" : "Create User" }}
    </h1>
  </div>

  <form
    @submit.prevent="onSubmit"
    class="relative h-full max-h-[calc(100vh-80px)] pb-6"
  >
    <div class="px-8 space-y-4 h-[90%] overflow-y-auto no-scrollbar">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Name</label>
        <Input
          v-model="name"
          placeholder="Enter user name"
          class="form-input"
          :class="{ 'border-red-500': errors.name }"
          :disabled="loading"
        />
        <ErrorMessage name="name" class="text-xs text-red-500 mt-1" />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <Input
          v-model="email"
          type="email"
          placeholder="Enter user email"
          class="form-input"
          :class="{ 'border-red-500': errors.email }"
          :disabled="loading"
        />
        <ErrorMessage name="email" class="text-xs text-red-500 mt-1" />
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium mb-1">Phone</label>
        <vue-tel-input
          :autoFormat="false"
          class="placeholder:!text-[12px] auth-input !pl-0 focus-within:!shadow-none !border-orange-highlight"
          v-model="phone"
        ></vue-tel-input>

        <ErrorMessage name="phone" class="text-xs text-red-500 mt-1" />
      </div>

      <!-- Password & Confirm -->
      <div v-if="!userToEdit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <Input
            v-model="password"
            type="password"
            placeholder="Enter password"
            class="form-input"
            :class="{ 'border-red-500': errors.password }"
            :disabled="loading"
          />
          <ErrorMessage name="password" class="text-xs text-red-500 mt-1" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <Input
            v-model="password_confirmation"
            type="password"
            placeholder="Confirm password"
            class="form-input"
            :class="{ 'border-red-500': errors.password_confirmation }"
            :disabled="loading"
          />
          <ErrorMessage
            name="password_confirmation"
            class="text-xs text-red-500 mt-1"
          />
        </div>
      </div>

      <!-- Roles -->
      <div class="pb-6">
        <label class="block text-sm font-medium mb-2">Assign Role</label>
        <MultiSelect
          :modelValue="roles"
          @update:model-value="handleRolesChange"
          :options="
            roleStore.roles.map((r) => ({
              value: r.id,
              label: r.name,
              icon: r.icon,
            }))
          "
          @blur="handleRolesBlur"
          placeholder="Select role..."
          :searchable="false"
          :select-all="false"
          :show-footer="false"
        />
        <p v-if="rolesErrorMessage" class="text-xs text-red-500 mt-1">
          {{ rolesErrorMessage }}
        </p>
      </div>

      <AlartMessage :errors="serverErrors" />
    </div>

    <div
      class="bg-gray-50 w-full absolute bottom-0 p-3 gap-3 flex border-t-[1px] justify-end"
    >
      <Button
        @click="emit('close')"
        type="button"
        class="btn !bg-white !text-black"
        variant="outline"
      >
        <span>CLOSE</span>
      </Button>
      <Button type="submit" :disabled="loading" class="btn">
        <span v-if="loading">
          {{ isEdit ? "Updating..." : "Creating..." }}
        </span>
        <span v-else>{{ isEdit ? "Update" : "Submit" }}</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ErrorMessage, useField, useForm } from "vee-validate";
import { ref, watch } from "vue";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multiselect/MultiSelect.vue";
import { useToast } from "@/composeable/useToast";
import { parseBackendError } from "@/lib/utils";
import AlartMessage from "@/shared/components/AlartMessage.vue";
import { useRoleStore } from "@/store/common/role-permission-store";
import { User2 } from "lucide-vue-next";
import { userService } from "@/services/user-service";

const { showToast } = useToast();
const props = defineProps<{
  //eslint-disable-next-line
  userToEdit?: any | null;
  isEdit: boolean;
}>();
const emit = defineEmits<{ (e: "close"): void; (e: "created"): void }>();

const roleStore = useRoleStore();
const loading = ref(false);
const serverErrors = ref<Record<string, string[]>>({});

const schema = {
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(
      /^(013|014|015|016|017|018|019)\d{8}$/,
      "Phone must be a valid Bangladeshi number with exactly 11 digits"
    ),
  password: yup
    .string()
    .nullable()
    .notRequired()
    .when([], {
      is: (val: string) => !!val,
      then: (schema) => schema.min(8, "Min 8 characters"),
    }),
  password_confirmation: yup
    .string()
    .nullable()
    .notRequired()
    .when("password", {
      is: (val: string) => !!val,
      then: (s) =>
        s
          .required("Confirm password is required")
          .oneOf([yup.ref("password")], "Passwords must match"),
    }),
};

const { handleSubmit, resetForm, setErrors, errors, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    email: "",
    phone: null,
    password: null,
    password_confirmation: "",
  },
});

const { value: name } = useField<string>("name");
const { value: email } = useField<string>("email");
const { value: phone } = useField<string>("phone");
const { value: password } = useField<string>("password");
const { value: password_confirmation } = useField<string>(
  "password_confirmation"
);

const {
  value: roles,
  errorMessage: rolesErrorMessage,
  handleChange: handleRolesChange,
  handleBlur: handleRolesBlur,
  setErrors: setRoleErrorMessage,
} = useField<number[]>("roles");

watch(
  () => props.userToEdit,
  (user) => {
    if (user) {
      resetForm({
        values: {
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          password: "",
          password_confirmation: "",
        },
      });
      // eslint-disable-next-line
      roles.value = user.roles?.map((r: any) => r.id) ?? [];
    } else {
      resetForm();
      roles.value = [];
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit(
  async (values, { resetForm: postSubmitReset }) => {
    if (!roles.value.length) {
      setRoleErrorMessage("Select at least one role");
      return;
    }

    loading.value = true;

    try {
      // eslint-disable-next-line
      const payload: any = {
        ...values,
        roles: roles.value,
      };

      // If editing and password is empty, remove it from the payload
      if (props.isEdit && !values.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      if (props.isEdit) {
        let res = await userService.update(props.userToEdit.id, payload);
        if (res.success) {
          showToast(res.message, "", "success");
        }
      } else {
        const res = await userService.create(payload);
        if (res.success) {
          showToast(res.message, "", "success");
        } else {
          const backendErrors = res?.error?.response?.data?.errors;
          if (backendErrors) {
            Object.keys(backendErrors).forEach((field) => {
              const messages = backendErrors[field];
              if (messages?.length > 0) {
                setFieldError(
                  field as
                    | "name"
                    | "email"
                    | "phone"
                    | "password"
                    | "password_confirmation",
                  messages[0]
                );
              }
            });
          }
        }
      }

      emit("created");
      emit("close");
      postSubmitReset();
      roles.value = [];
      //eslint-disable-next-line
    } catch (err: any) {
      const parsed = parseBackendError(err);
      setErrors(parsed.errors);
      serverErrors.value = parsed.errors;
    } finally {
      loading.value = false;
    }
  }
);
</script>
