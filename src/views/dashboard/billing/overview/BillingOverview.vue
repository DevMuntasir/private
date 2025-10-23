<template>
  <PageLayout title="Billing Overview">
    <BillingOverviewChart />
    <div class=" my-5 flex gap-5">
        <BillingPaymentMethodChart />
        <BillingStatementsTable />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import PageLayout from "@/layouts/components/PageLayout.vue";
import BillingOverviewChart from "./BillingOverviewChart.vue";
import BillingPaymentMethodChart from "./BillingPaymentMethodChart.vue";
import BillingStatementsTable from "./BillingStatementsTable.vue";
</script>
