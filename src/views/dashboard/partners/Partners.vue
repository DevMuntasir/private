<script setup lang="ts">
import { CardContent } from "@/components/ui/card";
import Card from "@/components/ui/card/Card.vue";
import PageLayout from "@/layouts/components/PageLayout.vue";
import PartnersTable from "./PartnersTable.vue";
</script>

<template>
  <PageLayout title="Partners">
    <div class="my-6">
      <Card
        class="bg-[#FF501F] text-white border-0 rounded-0 rounded-none p-0 min-h-[132px] max-w-[250px]"
      >
        <CardContent class="p-6">
          <div class="flex justify-between">
            <div>
              <div class="flex gap-2 mb-2">
                <span class="font-medium font-secondary-Regular text-md"
                  >Total Partners</span
                >
              </div>
              <div class="text-3xl font-bold flex">
                <img src="/icons/group.svg" />
                <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <PartnersTable />
      </div>
    </div>
  </PageLayout>
</template>
