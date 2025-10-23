<template>
  <div class="space-y-4 mt-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-3 w-full">
        <RouterLink
          v-if="canCreatePartner"
          :to="{
            name: 'partner-create',
          }"
        >
          <Button class="btn !py-5.5">+ Add New Partner</Button>
        </RouterLink>
      </div>

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
    <div class="border bg-white">
      <SearchAndFilterBar
        :search-query="searchQuery"
        :model-value="filters"
        @update:modelValue="(val) => Object.assign(filters.value, val)"
        :selected-filters="selectedFilters"
        @update:selectedFilters="(val) => (selectedFilters = val)"
        @update:searchQuery="(val) => (searchQuery = val)"
        :filter-options="filterOptions"
        :searchable="true"
        :can-search="true"
        :placeholder="'Search by partner name...'"
      />

      <!-- Your existing table, unmodified -->
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
          <template v-if="!loading && partnerStore.partners.length > 0">
            <TableRow
              v-for="partner in partnerStore.partners"
              :key="partner.id"
              :class="selectedUsers.includes(partner.id) ? 'bg-muted/50' : ''"
            >
              <TableCell class="w-[40px]">
                <Checkbox
                  class="checkbox"
                  :model-value="selectedScreen.includes(partner.id)"
                  @update:modelValue="(checked) => toggleRow(partner.id, checked as boolean)"
                />
              </TableCell>
              <TableCell>
                <RouterLink
                  :to="`/admin/screens/screen-details/${partner.id}`"
                  class="flex items-center space-x-3 capitalize text-secondary hover:underline font-medium"
                >
                  <p class="font-medium font-secondary-Regular text-left">
                    {{ partner.client_name }}
                  </p>
                </RouterLink>
              </TableCell>

              <TableCell class="text-left">{{ partner.total_ads }}</TableCell>
              <TableCell class="text-left">-</TableCell>
              <TableCell class="text-left">-</TableCell>
              <TableCell class="text-left">-</TableCell>
            </TableRow>
          </template>
          <template v-else-if="!loading && partnerStore.partners.length < 1">
            <TableRow>
              <TableCell :colspan="10" class="text-center py-6 text-gray-500">
                No partner found matching your filters.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <TableSkelton v-if="loading" :rows="pageSize" :columns="7" />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="  partnerStore.partners.length > 0"
      :current-page="currentPage"
      :last-page="partnerStore.pagination?.last_page || 1"
      :total="partnerStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="partnerStore.pagination?.from"
      :to="partnerStore.pagination?.to"
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

import Pagination from "@/shared/components/Pagination.vue";

import TableSkelton from "@/shared/components/TableSkelton.vue";
import { computed, onMounted, ref, watch } from "vue";
import SearchAndFilterBar from "../clients/SearchAndFilterBar.vue";
import { useAdminPartnerStore } from "@/store/admin-partner-store";
import { useRoleStore } from "@/store/common/role-permission-store";
import { AdminComponentPermissions } from "@/constant/permission";

const filterOptions = [
  { label: "Status", value: "status", disable: false },
  { label: "Live Ads", value: "live_ads", disable: true },
];

const selectedFilters = ref<string[]>([]);
// const adminScreenStore = useAdminScreenStore();
const partnerStore = useAdminPartnerStore();
const selectedUsers = ref<number[]>([]);
const loading = ref(false);
const roleStore = useRoleStore();
const partnerPermissions = AdminComponentPermissions.PartnersTable;
const canCreatePartner = computed(() =>
  roleStore.hasPermission(partnerPermissions.create)
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
    await partnerStore.fetchAllAdminPartnersIndex(buildApiParams(),1);
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
    partnerStore.partners.length > 0 &&
    selectedScreen.value.length ===   partnerStore.partners.length
  );
});
const isIndeterminate = computed(() => {
  return (
    selectedScreen.value.length > 0 &&
    selectedScreen.value.length <   partnerStore.partners.length
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
    setSelectedScreen(  partnerStore.partners.map((c) => c.id));
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
