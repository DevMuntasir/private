<template>
  <div class="space-y-4 mt-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-3 w-full">
        <RouterLink
          v-if="canCreateScreen"
          :to="{
            name: 'screen-create',
          }"
        >
          <Button class="btn !py-5.5">+ Add New Screen</Button>
        </RouterLink>
      </div>

      <div class="flex items-center space-x-2">
        <Select v-model="pageSize" v-if="canViewScreens">
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

    <div class="border bg-white" v-if="canViewScreens">
      <!-- <SearchAndFilterBar
        :search-query="searchQuery"
        :model-value="filters"
        @update:modelValue="(val) => Object.assign(filters.value, val)"
        :selected-filters="selectedFilters"
        @update:selectedFilters="(val) => (selectedFilters = val)"
        @update:searchQuery="(val) => (searchQuery = val)"
        :filter-options="filterOptions"
        :searchable="true"
        :can-search="true"
        :placeholder="'Search by screen name...'"
        :status-option="ScreenConstant.getStatusOptions()"
        :canFilter="true"
      /> -->

      <Table>
        <TableHeader class="h-[55px]">
          <TableRow class="bg-table-header">
            <TableHead class="w-[40px] px-5">
              <Checkbox
                class="checkbox"
                :model-value="allSelected"
                :indeterminate="isIndeterminate"
                @update:modelValue="toggleSelectAll"
              />
            </TableHead>

            <TableHead @click="handleSort('name')" class="cursor-pointer">
              Screens Name
              <span v-if="sortBy.startsWith('name')">
                {{ sortBy.endsWith("asc") ? "↑" : "↓" }}
              </span>
            </TableHead>
            <TableHead @click="handleSort('status')" class="cursor-pointer">
              Store Name
              <span v-if="sortBy.startsWith('store_name')">
                {{ sortBy.endsWith("asc") ? "↑" : "↓" }}
              </span>
            </TableHead>
            <TableHead @click="handleSort('budget')" class="cursor-pointer">
              Status
            </TableHead>
            <TableHead @click="handleSort('budget')" class="cursor-pointer">
              Location
            </TableHead>

            <TableHead @click="handleSort('is_admin')" class="cursor-pointer"
              >Store Type</TableHead
            >
            <TableHead @click="handleSort('is_admin')" class="cursor-pointer"
              >Active Devices</TableHead
            >
            <TableHead
              @click="handleSort('is_admin')"
              class="cursor-pointer text-right px-6"
              >Action</TableHead
            >
          </TableRow>
        </TableHeader>

        <TableBody class="overflow-auto">
          <template v-if="!loading && screenStore.screens.length > 0">
            <TableRow
              v-for="screens in screenStore.screens"
              :key="screens.id"
              :class="selectedUsers.includes(screens.id) ? 'bg-muted/50' : ''"
            >
              <TableCell class="w-[40px]">
                <Checkbox
                  class="checkbox"
                  :model-value="selectedScreen.includes(screens.id)"
                  @update:modelValue="(checked) => toggleRow(screens.id, checked as boolean)"
                />
              </TableCell>
              <TableCell>

                  <p
                    class="font-secondary-Regular font-semibold text-primary text-left"
                  >
                    {{ screens.name }}
                  </p>
 
              </TableCell>

              <TableCell class="text-left">{{ screens.store_name }}</TableCell>
              <TableCell class="text-left">{{
                screens.status.label
              }}</TableCell>
              <TableCell class="text-left">{{
                screens.location.name
              }}</TableCell>

              <TableCell class="text-left">{{
                screens.store_info.type
              }}</TableCell>
              <TableCell class="text-left">{{
                screens.store_info.type
              }}</TableCell>
              <TableCell class="text-right !gap-2 flex justify-end">
                  <Button
                    v-if="canUpdateScreen"
                    variant="ghost"
                    class="border-[1px] bg-secondary/10"
                  >
                    <Pencil :size="18" class="text-2xl" />
                  </Button>
                  <Button
                    v-if="canViewScreenReport"
                    variant="ghost"
                    class="border-[1px] bg-secondary/10"
                  >
                    <ChartNoAxesCombined :size="18" class="text-2xl" />
                  </Button>
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="!loading && screenStore.screens.length < 1">
            <TableRow>
              <TableCell :colspan="10" class="text-center py-6 text-gray-500">
                No campaign found matching your filters.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <TableSkelton v-if="loading" :rows="pageSize" :columns="7" />
    </div>
    <ComponentPermissionError v-else />

    <Pagination
      v-if="canViewScreens && screenStore.screens.length > 0"
      :current-page="currentPage"
      :last-page="screenStore.pagination?.last_page || 1"
      :total="screenStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="screenStore.pagination?.from"
      :to="screenStore.pagination?.to"
      @page-change="setPage"
    />
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
import ComponentPermissionError from "@/shared/components/ComponentPermissionError.vue";
import Pagination from "@/shared/components/Pagination.vue";
import { useRoleStore } from "@/store/common/role-permission-store";
import { PNComponentPermissions } from "@/constant/permission";
import { ScreenConstant } from "@/constant/screen";
import TableSkelton from "@/shared/components/TableSkelton.vue";
import { useScreenStore } from "@/store/screen-store";
import { ChartNoAxesCombined, Pencil } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
// import SearchAndFilterBar from "../clients/SearchAndFilterBar.vue";

const filterOptions = [
  { label: "Status", value: "status", disable: false },
  { label: "Live Ads", value: "live_ads", disable: true },
];

const selectedFilters = ref<string[]>([]);
const screenStore = useScreenStore();
const roleStore = useRoleStore();
const selectedUsers = ref<number[]>([]);
const loading = ref(false);
const screenPermissions = PNComponentPermissions.ScreenTable;
const screenReportPermissions = PNComponentPermissions.ScreenReportTable;

const canCreateScreen = computed(() =>
  roleStore.hasPermission(screenPermissions.create)
);
const canViewScreens = computed(() =>
  roleStore.hasPermission(screenPermissions.view)
);
const canUpdateScreen = computed(() =>
  roleStore.hasPermission(screenPermissions.update)
);
const canViewScreenReport = computed(() =>
  roleStore.hasPermission(screenReportPermissions.view)
);

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
    status: 1,
  },
  ["status", "live_ads", "active_devices", "video_plays", "impressions"]
);

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

const fetch = async () => {
  if (!canViewScreens.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    await screenStore.fetchAllScreenIndex(buildApiParams());
  } finally {
    loading.value = false;
  }
};

watch([debouncedSearch, currentPage, pageSize, sortBy, status], fetch);

onMounted(() => {
  fetch();
});

const selectedScreen = ref<number[]>([]);
const allSelected = computed(() => {
  return (
    screenStore.screens.length > 0 &&
    selectedScreen.value.length === screenStore.screens.length
  );
});
const isIndeterminate = computed(() => {
  return (
    selectedScreen.value.length > 0 &&
    selectedScreen.value.length < screenStore.screens.length
  );
});

const toggleRow = (id: number, checked: boolean) => {
  if (checked && !selectedScreen.value.includes(id)) {
    selectedScreen.value = [...selectedScreen.value, id];
  } else if (!checked) {
    selectedScreen.value = selectedScreen.value.filter((item) => item !== id);
  }
};

const setSelectedScreen = (ids: number[]) => {
  selectedScreen.value = [...ids];
};

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedScreen(screenStore.screens.map((c) => c.id));
  } else {
    setSelectedScreen([]);
  }
};

const handleSort = (field: string) => {
  const [currField, currDir] = sortBy.value.split(":");
  const nextDir = currField === field && currDir === "asc" ? "desc" : "asc";
  setSort(`${field}:${nextDir}`);
};
</script>
