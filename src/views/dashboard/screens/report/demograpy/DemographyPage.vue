<script setup lang="ts">
import PageLayout from "@/layouts/components/PageLayout.vue";
import DemographyAgeChart from "./DemographyAgeChart.vue";
import DemographyGenderChart from "./DemographyGenderChart.vue";
import DemographyOverviewChart from "./DemographyOverviewChart.vue";
</script>

<template>
  <PageLayout title="Screen Demography Report">
    <div class=" flex gap-8 mt-5">
        <DemographyGenderChart />
      <DemographyAgeChart />
    </div>
    <DemographyOverviewChart class=" mt-8"/>
  </PageLayout>
</template>
