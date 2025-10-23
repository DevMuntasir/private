<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Label from '@/components/ui/label/Label.vue';
import PageLayout from '@/layouts/components/PageLayout.vue';
import { profileSettingsService } from '@/services/profile-settings-service';
import { useUserStore } from '@/store/user-store';
import { AdminUser } from '@/types/user-types';
import { LoaderIcon } from 'lucide-vue-next';
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import * as yup from "yup";

const profileImage = ref("/placeholder.svg?height=100&width=100");
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const userStore = useUserStore();
const loading = ref(true);
const userInfo = ref<AdminUser | null>(null);

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().required("Email is required").email("Invalid email"),
  phone: yup
    .string()
    .required("Phone is required")
    .min(11, "Minimum 11 digits"),
});
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !userInfo.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    profileImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append("profile_image", file);

  try {
    uploading.value = true;
    const res = await profileSettingsService.uploadProfileImage(
      formData,
      userInfo.value.id
    );
    if (res.success) {
      toast(res.message, {
        description: "Profile image updated.",
      });
    } else {
      toast({
        title: "Upload failed",
        description: res.message,
        variant: "destructive",
      });
    }
  } catch (err) {
    toast({
      title: "Error",
      description: "Upload failed",
      variant: "destructive",
    });
    console.error(err);
  } finally {
    uploading.value = false;
  }
};

const triggerFileInput = () => fileInputRef.value?.click();
const removeImage = () => {
  profileImage.value = "/placeholder.svg?height=100&width=100";
  if (fileInputRef.value) fileInputRef.value.value = "";
};
//eslint-disable-next-line
async function onSubmit(values: Record<string, any>) {
  try {
    let res = await userStore.updateUser(userInfo.value.id, values);

    if (res) {
      toast("Successfully updated!", {
        description: "Profile information updated.",
        style:{
            background: 'green',
            color:'white'
        }
      });
    }
  } 
  //eslint-disable-next-line
  catch (error) {
    toast("Something went wrong", {
      description: "Profile information updated.",
    });
  }
}
onMounted(async () => {
  loading.value = true;
  try {
    let res = await userStore.fetchAuthUserInfo();
    userInfo.value = res;
    profileImage.value = res.profile_image;
    console.log(userInfo.value);
    
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});


</script>

<template>
  <PageLayout title="Account Settings">
    <Card class="rounded-none mx-10 shadow-none max-w-[550px] mt-4">
      <div v-if="loading" class="flex justify-center items-center h-40">
        <LoaderIcon class="animate-spin w-6 h-6 text-muted-foreground" />
        <span class="ml-2">Loading...</span>
      </div>
      <CardContent v-else class="space-y-6">
            <!-- Profile Image -->
            <div class="space-y-4">
              <Label class="text-sm font-medium">Profile Image</Label>
              <div class="flex items-center space-x-4">
                <Avatar
                  class="h-20 w-20 border-4 shadow-secondary/10 shadow-xl"
                >
                  <AvatarImage :src="profileImage" />
                  <AvatarFallback><User class="h-8 w-8" /></AvatarFallback>
                </Avatar>
                <div class="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="triggerFileInput"
                    :disabled="uploading"
                  >
                    <LoaderIcon
                      v-if="uploading"
                      class="h-4 w-4"
                      :class="{ 'animate-spin': uploading }"
                    />
                    <span>{{
                      uploading ? "Uploading..." : "Upload Image"
                    }}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-destructive"
                    @click="removeImage"
                    >Remove</Button
                  >
                </div>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload"
              />
              <p class="text-xs text-muted-foreground">
                Recommended: Square image, at least 400x400px
              </p>
            </div>

            <div
              class="bg-gray-100/50 flex justify-between p-3 px-4 rounded-lg border"
            >
              <div>
                <h4 class="text-[16px] font-primary font-medium">
                  Account Status
                </h4>
                <span
                  class="text-sm text-secondary-foreground font-secondary-Regular"
                  >Admin</span
                >
              </div>
              <div>
                <h4 class="text-[16px] font-primary font-medium">
                  Joining Date
                </h4>
                <span
                  class="text-sm text-secondary-foreground font-secondary-Regular"
                  >7/15/2025</span
                >
              </div>
            </div>

            <VeeForm
              v-if="userInfo"
              :validation-schema="schema"
              :initial-values="{
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone,
              }"
              @submit="onSubmit"
              class="space-y-3"
            >
              <div class="space-y-1">
                <Label for="name">Account Name</Label>
                <Field name="name" as="input" class="form-input mt-2" />
                <ErrorMessage name="name" class="text-sm text-red-500" />
              </div>
              <div class="space-y-1">
                <Label for="email">Email</Label>
                <Field
                  name="email"
                  as="input"
                  :readonly="true"
                  class="form-input mt-2"
                />
                <ErrorMessage name="email" class="text-sm text-red-500" />
              </div>
              <div class="space-y-1">
                <Label for="phone">Phone</Label>
                <Field name="phone" as="input" class="form-input mt-2" />
                <ErrorMessage name="phone" class="text-sm text-red-500" />
              </div>
              <Button class="btn mt-4" type="submit">
                <LoaderIcon
                  v-if="userStore.authUser.loading"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                />

                {{
                  userStore.authUser.loading
                    ? "Updating..."
                    : "Save changes"
                }}
              </Button>
            </VeeForm>
      </CardContent>
    </Card>
  </PageLayout>
</template>

