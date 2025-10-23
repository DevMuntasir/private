<template>
  <PageLayout title="Create Ad">
    <AdForm />
  </PageLayout>
</template>

<script setup>
import PageLayout from '@/layouts/components/PageLayout.vue';
import AdForm from '@/shared/components/AdForm.vue';
import { useScrollToTop } from '@/composeable/useScrollToTop';
useScrollToTop(true);
</script>