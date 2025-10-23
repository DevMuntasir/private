<template>
  <div class="space-y-4 mt-6">
    <template v-if="canViewLocations">
    <div class="flex items-center justify-between">
      <Dialog v-if="canCreateLocation" v-model:open="isCreateOpen">
        <DialogTrigger as-child>
          <Button class="btn">+ Add New Location</Button>
        </DialogTrigger>
        <DialogContent>
          <CreateLocation @refresh-locations="onRefreshLocations" />
        </DialogContent>
      </Dialog>
      <!-- Per page dropdown -->
      <div class="flex items-center space-x-2">
        <Select v-model="pageSize">
          <SelectTrigger
            class="w-[120px] font-primary !h-[40px] rounded-[3px] bg-white"
          >
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Per Page</SelectLabel>
            <SelectItem v-for="size in [5, 10, 20]" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <!-- Search & Add Filter -->
    <div class="border bg-white relative">
      <SearchAndFilterBar
        :search-query="searchQuery"
        :model-value="filters"
        @update:modelValue="(val) => (filters = { ...filters, ...val })"
        :selected-filters="selectedFilters"
        @update:selectedFilters="(val) => (selectedFilters = val)"
        @update:searchQuery="(val) => (searchQuery = val)"
        :filter-options="filterOptions"
        :searchable="true"
        :can-search="true"
        :placeholder="'Search by location name...'"
        :statusOption="[]"
        filter-for="other"
      />

      <div
        ref="dragWrapper"
        :class="['table-drag-scroll', { 'is-dragging': isDraggingTable }]"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
        @pointercancel="handlePointerUp"
        style="--sticky-name-width: 14rem"
      >
        <Table class="relative w-full border-separate border-spacing-0">
          <TableHeader class="h-[55px]">
            <TableRow class="bg-table-header">
              <TableHead
                @click="handleSort('name')"
                class="cursor-pointer bg-table-header text-center"
              >
                City Name
              </TableHead>
              <TableHead
                @click="handleSort('budget')"
                class="cursor-pointer bg-table-header w-[250px]"
              >
                Locations
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <template v-if="!loading && normalized.length">
              <template v-for="country in normalized" :key="country.country">
                <template v-for="row in country.rows" :key="row.key">
                  <TableRow
                    :class="
                      selectedCampaigns.includes(country.countryId)
                        ? 'bg-muted/50'
                        : ''
                    "
                  >
                    <TableCell
                      class="w-[200px] align-middle text-center font-secondary-Regular capitalize"
                    >
                      {{ row.city }}
                    </TableCell>

                    <TableCell class="align-top font-secondary-Regular capitalize">
                      <template v-if="row.areasText.length > 0">
                        <Badge
                          v-for="(area, index) in row.areasText"
                          :key="index"
                          class="mr-1 mb-1 rounded-[3px] bg-primary/10 text-secondary font-medium"
                          >{{ area }}</Badge
                        >
                      </template>
                      <template v-else>
                        <span class="text-gray-500">No location available!</span>
                      </template>
                    </TableCell>
                  </TableRow>
                </template>
              </template>
            </template>

            <template v-else-if="!loading">
              <TableRow>
                <TableCell :colspan="10" class="text-center py-6 text-gray-500">
                  No data available.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <TableSkelton v-if="loading" :rows="pageSize" :columns="2" />
    </div>
    <Pagination
      v-if="locationStore.locations.length > 0"
      :current-page="currentPage"
      :last-page="locationStore.pagination?.last_page || 1"
      :total="locationStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="locationStore.pagination?.from"
      :to="locationStore.pagination?.to"
      @page-change="setPage"
    />
    </template>
    <ComponentPermissionError v-else />
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchQuary } from "@/composeable/userSearchQuary";

import { useHorizontalDragScroll } from "@/composeable/useHorizontalDragScroll";

import { useRoleStore } from "@/store/common/role-permission-store";
import { PNComponentPermissions } from "@/constant/permission";
import ComponentPermissionError from "@/shared/components/ComponentPermissionError.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Pagination from "@/shared/components/Pagination.vue";
import TableSkelton from "@/shared/components/TableSkelton.vue";

import { computed, onMounted, ref, watch } from "vue";
// import SearchAndFilterBar from "../clients/SearchAndFilterBar.vue";
import { useLocationStore } from "@/store/location-store";
import CreateLocation from "./CreateLocation.vue";
import SearchAndFilterBar from "@/shared/components/SearchAndFilterBar.vue";
const isCreateOpen = ref(false);
const filterOptions = [
  { label: "Status", value: "status", disable: false },
  { label: "Live Ads", value: "live_ads", disable: true },
];

const selectedFilters = ref<string[]>([]);
const locationStore = useLocationStore();
const roleStore = useRoleStore();
const locationPermissions = PNComponentPermissions.LocationTable;
const canViewLocations = computed(() =>
  roleStore.hasPermission(locationPermissions.view)
);
const canCreateLocation = computed(() =>
  roleStore.hasPermission(locationPermissions.create)
);
const loading = ref(false);

const {
  containerRef: dragWrapper,
  isDragging: isDraggingTable,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} = useHorizontalDragScroll();

const {
  searchQuery,
  debouncedSearch,
  currentPage,
  pageSize,
  sortBy,
  buildApiParams,
  filters,
  setPage,
  setSort,
  status,
} = useSearchQuary(
  {
    page: 1,
    perPage: 10,
    search: "",
    sortBy: "name:asc",
    status: null,
  },
  ["status", "live_ads", "active_devices", "video_plays", "impressions"]
);

const normalized = computed(() => {
  return (locationStore.locations || [])
    .map((loc) => {
      const rows: Array<{
        key: string;
        city: string;
        areasText: string[];
      }> = [];

      const cities =
        Array.isArray(loc.cities) && loc.cities.length ? loc.cities : [];

      cities.forEach((city) => {
        const areas =
          Array.isArray(city.locations) && city.locations.length
            ? city.locations.map((a: { name?: string }) => a?.name || "No city available!")
            : [];

        rows.push({
          key: `${loc.id}-${city.name}-all`,
          city: city.name || "No City available!",
          areasText: areas,
        });
      });

      return {
        countryId: loc.id,
        country: loc.country || "-",
        rows,
        totalRows: rows.length,
      };
    })
    .filter((entry) => entry.rows.length > 0);
});

let statusAlreadyPushed = false;
watch(
  () => filters.value.status,
  (newStatus) => {
    if (
      newStatus !== undefined &&
      newStatus !== null &&
      !statusAlreadyPushed &&
      !selectedFilters.value.includes("status")
    ) {
      selectedFilters.value.push("status");
      statusAlreadyPushed = true;
    }
  },
  { immediate: true }
);

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(
  () => filters.value.status,
  (newVal) => {
    status.value = newVal == null || newVal === "" ? null : Number(newVal);
  }
);

const fetchCampaign = async () => {
  if (!canViewLocations.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    await locationStore.fetchAllLocationWithCityCountry(buildApiParams());
  } finally {
    loading.value = false;
  }
};
const onRefreshLocations = async () => {
  await fetchCampaign().then(() => (isCreateOpen.value = false));
};
watch([debouncedSearch, currentPage, pageSize, sortBy, status], fetchCampaign);
watch(canViewLocations, (hasAccess) => {
  if (hasAccess && locationStore.locations.length === 0) {
    fetchCampaign();
  }
});

onMounted(() => {
  fetchCampaign();
  roleStore.fetchAllRoleIndex();
  if (!roleStore.permissionsLoaded) {
    roleStore.fetchSignlePermissions();
  }
});

const selectedCampaigns = ref<number[]>([]);

const handleSort = (field: string) => {
  const [currField, currDir] = sortBy.value.split(":");
  const nextDir = currField === field && currDir === "asc" ? "desc" : "asc";
  setSort(`${field}:${nextDir}`);
};
</script>
