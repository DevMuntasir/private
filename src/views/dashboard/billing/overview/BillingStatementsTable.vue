<template>
  <div class="space-y-4 flex-1">
    <div class="border bg-white">
        <div class=" py-3 px-6">
            <h1 class=" text-md font-primary text-secondary ">Statements</h1>
        </div>
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
            <TableHead @click="handleSort('is_admin')" class="cursor-pointer"
              >Profile detail</TableHead
            >
          </TableRow>
        </TableHeader>

        <TableBody class="overflow-auto">
          <template v-if="!loading && adminScreenStore.screens.length > 0">
            <TableRow
              v-for="screens in adminScreenStore.screens"
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
                <RouterLink
                  :to="`/admin/screens/screen-details/${screens.id}`"
                  class="flex items-center space-x-3 capitalize text-secondary hover:underline font-medium"
                >
                  <p class="font-medium font-secondary-Regular text-left">
                    #{{ screens.name }}
                  </p>
                </RouterLink>
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
            </TableRow>
          </template>
          <template v-else-if="!loading && adminScreenStore.screens.length < 1">
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

    <!-- Pagination -->
    <Pagination
      v-if="adminScreenStore.screens.length > 0"
      :current-page="currentPage"
      :last-page="adminScreenStore.pagination?.last_page || 1"
      :total="adminScreenStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="adminScreenStore.pagination?.from"
      :to="adminScreenStore.pagination?.to"
      @page-change="setPage"
    />
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useSearchQuary } from "@/composeable/userSearchQuary";

import Pagination from "@/shared/components/Pagination.vue";
// import { useRoleStore } from "@/store/common/role-permission-store";

import TableSkelton from "@/shared/components/TableSkelton.vue";
import { useAdminScreenStore } from "@/store/screen-store";
import { computed, onMounted, ref, watch } from "vue";

// const filterOptions = [
//   { label: "Status", value: "status", disable: false },
//   { label: "Live Ads", value: "live_ads", disable: true },
// ];

const selectedFilters = ref<string[]>([]);
const adminScreenStore = useAdminScreenStore();
// const clientRoles = useRoleStore();
const selectedUsers = ref<number[]>([]);
const loading = ref(false);

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

// ✅ Sync selectedFilters with query filters like "status"
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

// ✅ Keep search query in sync with URL
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

// ✅ Update `status` field in searchQuery manually
watch(
  () => filters.value.status,
  (newVal) => {
    status.value = newVal == null || newVal === '' ? null : Number(newVal);
  }
);

// ✅ Fetch campaign data when key changes
const fetch = async () => {
  loading.value = true;
  try {
    await adminScreenStore.fetchAllAdminScreenIndex(buildApiParams());
  } finally {
    loading.value = false;
  }
};

watch([debouncedSearch, currentPage, pageSize, sortBy, status], fetch);

onMounted(() => {
  fetch();
  //   clientRoles.fetchAllRoleIndex();
  //   if (!clientRoles.permissionsLoaded) {
  //     clientRoles.fetchSignlePermissions();
  //   }
});

const selectedScreen = ref<number[]>([]);
const allSelected = computed(() => {
  return (
    adminScreenStore.screens.length > 0 &&
    selectedScreen.value.length === adminScreenStore.screens.length
  );
});
const isIndeterminate = computed(() => {
  return (
    selectedScreen.value.length > 0 &&
    selectedScreen.value.length < adminScreenStore.screens.length
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
    setSelectedScreen(adminScreenStore.screens.map((c) => c.id));
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
