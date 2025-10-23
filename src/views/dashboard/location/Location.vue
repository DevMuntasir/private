<template>
  <PageLayout title="Location">

    <div class="px-10 py-5">
      <LocationStats/>
      <LocationTable />

    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import PageLayout from "@/layouts/components/PageLayout.vue";
import LocationStats from "./LocationStats.vue";
import LocationTable from "./LocationTable.vue";

</script>
