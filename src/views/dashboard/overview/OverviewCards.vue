<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
    <!-- Total Payments -->
    <Card
      class="bg-[#FF501F] text-white border-0 rounded-0 rounded-none p-0 min-h-[132px]"
    >
      <CardContent class="p-6">
        <div class="flex justify-between">
          <div>
            <div class="flex gap-2 mb-2">
              <span class="font-medium font-secondary-Regular text-md"
                >Total Payments</span
              >
            </div>
            <div class="text-3xl font-bold flex">
              <img src="/public/icons/user.svg" />
              <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total Clients -->
    <Card
      class="bg-[#4C4C4D] text-white border-0 rounded-none p-0 min-h-[132px]"
    >
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
            
              <span class="text-sm font-medium">Total Clients</span>
            </div>
            <div class="text-3xl font-bold flex">
              <img src="/public/icons/group.svg" />
              <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total Campaigns -->
    <Card
      class="bg-[#E08C23] text-white border-0 rounded-none p-0 min-h-[132px]"
    >
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
             
              <span class="text-sm font-medium">Total Campaigns</span>
            </div>
            <div class="text-3xl font-bold flex">
              <img src="/public/icons/campaign.svg" />
              <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
            </div>
            <div class="text-sm opacity-90">Campaign Revenue: $4500</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total Ads -->
    <Card
      class="bg-[#E6B71D] text-white border-0 rounded-none p-0 min-h-[132px]"
    >
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
            
              <span class="text-sm font-medium">Total Ads</span>
            </div>
            <div class="text-3xl font-bold flex">
              <img src="/public/icons/play.svg" />
              <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Active Clients -->
    <Card
      class="bg-[#C7B299] text-white border-0 rounded-none p-0 min-h-[132px]"
    >
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              
              <span class="text-sm font-medium">Active Clients</span>
            </div>
            <div class="text-3xl font-bold flex">
              <img src="/public/icons/screen.svg" />
              <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total Ad Spend -->
    <Card
      class="bg-[#CAA66B] text-white border-0 rounded-none p-0 min-h-[132px]"
    >
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
         
              <span class="text-sm font-medium">Total Ad Spend</span>
            </div>
            <div class="text-3xl font-bold flex">
              <img src="/public/icons/money.svg" />
              <span class="ml-1 pt-1 text-[38px] font-primary">15</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";

</script>
