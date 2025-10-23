<script setup lang="ts">
import PageLayout from "@/layouts/components/PageLayout.vue";
import { useAdminScreenStore } from "@/store/screen-store";
import { useScreenStatusStore } from "@/store/use-screen-status-store";
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import AdPlaysGantt from "../AdPlaysGantt.vue";
import ScreenStatusSynchronizedCharts from "./ScreenStatusSynchronizedCharts.vue";

const route = useRoute();
const screenStore = useAdminScreenStore();
const statusStore = useScreenStatusStore();

const screenId = computed(() => {
  const v = route.params.screenId;
  return v ? v : null;
});

const ready = ref(false);

async function init(id: string) {
  if (!id) return;

  ready.value = false;

  screenStore.stopLogsPolling();

  screenStore.resetScreenVideoPlayData();

  await screenStore.fetchScreenVideoPlayData(id, { per_page: 100 });

  if (!screenStore.filterFromDateTime && !screenStore.filterToDateTime) {
    screenStore.startLogsPolling(id, 100);
  }

  statusStore.setScreen(id);
  statusStore.startPolling(15000);

  ready.value = true;
}

watch(
  () => route.params.screenId,
  (val) => {
    const id = val;
    if (id) init(id as string);
  },
  { immediate: true }
);

watch(
  () => [screenStore.filterFromDateTime, screenStore.filterToDateTime],
  ([from, to]) => {
    const active = !!(from || to);
    if (screenId.value) {
      if (active) {
        screenStore.stopLogsPolling();
      } else {
        screenStore.startLogsPolling(screenId.value as string, 100);
      }
    }
  }
);

onBeforeUnmount(() => {
  screenStore.stopLogsPolling();
  statusStore.stopPolling();
});
</script>

<template>
  <PageLayout :title="route.params.screenId ? `Screen ${route.params.screenId} Report` : 'Screen Report' ">
    <div v-if="ready" class="mt-5 bg-white">
      <AdPlaysGantt
        :key="'gantt-'+screenId"
        mode="ads"
        :plays="screenStore.screenVideoPlayData"
        :hasMore="screenStore.hasMoreLogs"
        @loadMore="() => screenId && screenStore.fetchScreenVideoPlayDataMore(screenId as string, { per_page: 100 })"
        :durationSec="8"
        :demoExtraCount="0"
      />
    </div>

    <div v-if="ready">
      <ScreenStatusSynchronizedCharts :key="'status-'+screenId" />
    </div>
  </PageLayout>
</template>
