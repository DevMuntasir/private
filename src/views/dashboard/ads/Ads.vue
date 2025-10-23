<script setup lang="ts">
import { CardContent } from "@/components/ui/card";
import Card from "@/components/ui/card/Card.vue";
import PageLayout from "@/layouts/components/PageLayout.vue";
import AdsTable from "./AdsTable.vue";
import { useAdsStore } from "@/store/ad-store";
const adStore = useAdsStore()
</script>

<template>
  <PageLayout title="Ads">
    <div class="my-6">
      <Card
        class="bg-[#FF501F] text-white border-0 rounded-0 rounded-none p-0 min-h-[132px] max-w-[250px]"
      >
        <CardContent class="p-6">
          <div class="flex justify-between">
            <div>
              <div class="flex gap-2 mb-2">
                <span class="font-medium font-secondary-Regular text-md"
                  >Total Ads</span
                >
              </div>
              <div class="text-3xl font-bold flex">
                <img src="/public/icons/group.svg" />
                <span class="ml-1 pt-1 text-[38px] font-primary">{{ adStore?.pagination?.total }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <AdsTable />
      </div>
    </div>
  </PageLayout>
</template>
