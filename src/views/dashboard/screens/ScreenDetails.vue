<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PNPermissionServiceConstant } from "@/constant/permission";
import PageLayout from "@/layouts/components/PageLayout.vue";
import { useRoleStore } from "@/store/common/role-permission-store";
import { useScreenStore } from "@/store/screen-store";
import { Screens } from "@/types/screen-type";
import { Pencil } from "lucide-vue-next";
import ScreenSkelton from "./ScreenSkelton.vue";

const route = useRoute(); 
const adminScreenStore = useScreenStore();
const roleStore = useRoleStore();
const screenDetails =ref<Screens>(null)
const canUpdateScreen = computed(() =>roleStore.hasPermission(PNPermissionServiceConstant.ScreenTable.update));


onMounted(async () => {
  try {
    const screenId = route.params.screenId;
   let res =  await adminScreenStore.fetchScreenDetailsByScreenId(Number(screenId));
   screenDetails.value = res
  } catch (error) {
    console.error("Error fetching campaign:", error);
  }
});
</script>

<template>
<PageLayout title=" Screen Details">

      <ScreenSkelton v-if="adminScreenStore.loading" />
  <div v-if="!adminScreenStore.loading">
    <div
      class="w-full max-w-[700px] rounded-lg border bg-white p-6 shadow mt-5 font-secondary-Regular"
    >
      <div class="mb-4 text-sm font-medium text-gray-900  pb-3">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-primary" />
          <p class="capitalize rounded-2xl">{{
            screenDetails?.status?.label
          }}</p>
        </div>
      </div>


      <div class="mb-4 border-t pt-4 text-sm">
        <div class="text-gray-800 text-[15px] font-semibold">Screen name</div>
        <div class="text-gray-500 font-medium">{{ screenDetails?.name }}</div>
      </div>
      <div class="mb-4 border-t pt-4 text-sm">
        <div class="text-gray-800 text-[15px] font-semibold">Store name</div>
        <div class="text-gray-500 font-medium">{{ screenDetails?.store_name }}</div>
      </div>
      <div class="mb-4 border-t pt-4 text-sm">
        <div class="text-gray-800 text-[15px] font-semibold">Location</div>
        <div class="text-gray-500 font-medium">{{ screenDetails?.location.name }}</div>
      </div>



      <div class="mb-6 border-t pt-4 text-sm">
        <div class="text-gray-800 font-secondary-Regular text-[15px] font-semibold mb-3">Locations</div>
        <div class="text-gray-500 font-medium">
          <Badge
            class="mr-2 mb-2 rounded-2xl text-white bg-primary text-[13px] font-secondary-Regular"
            >{{ screenDetails?.location.name }}</Badge
          >
        </div>
      </div>
      <RouterLink
        v-if="canUpdateScreen"
        :to="{
          name: 'screen-edit',
          params: {
            screenId:route.params.screenId,
          }
        }"
      >
        <Button class="btn !px-8"> <Pencil /> Edit  </Button>
      </RouterLink>
    </div>
  </div>
</PageLayout>
</template>
