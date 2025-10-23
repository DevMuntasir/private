<script setup lang="ts">
import PageLayout from '@/layouts/components/PageLayout.vue';
import PopularTimeChart from './PopularTimeChart.vue';
import OpenCloseChart from './OpenCloseChart.vue';

</script>


<template>
<PageLayout title="Popular Time">
    <OpenCloseChart class=" my-5" />
    <PopularTimeChart/>
</PageLayout>
</template>


