<template>
  <PageLayout title=" Role List">
    <template v-if="canViewRoles">
    <div class="mb-6 flex flex-col sm:flex-row justify-between gap-4 mt-5">
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="Search roles by name..."
        class="form-input max-w-[400px]"
      />

      <div class="flex gap-2">
        <Select
          :model-value="pageSize.toString()"
          @update:model-value="handlePageSizeChange"
        >
          <SelectTrigger class="w-[180px] form-input bg-white">
            <SelectValue placeholder="Select per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Per Page</SelectLabel>
              <SelectItem value="3">3 per page</SelectItem>
              <SelectItem value="6">6 per page</SelectItem>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="24">24 per page</SelectItem>
              <SelectItem value="48">48 per page</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select :model-value="sortBy" @update:model-value="handleSortChange">
          <SelectTrigger class="w-[180px] form-input bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort By</SelectLabel>
              <SelectItem value="name:asc">Name (A-Z)</SelectItem>
              <SelectItem value="name:desc">Name (Z-A)</SelectItem>
              <SelectItem value="created_at:desc">Newest First</SelectItem>
              <SelectItem value="created_at:asc">Oldest First</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          v-if="canCreateRole"
          class="!px-6 py-2 btn h-full"
          @click="openAddModal"
        >
          <Plus /> Add New Role
        </Button>
      </div>
    </div>
    <!-- <div
      v-if="roleStore.error"
      class="flex justify-between items-center bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-6"
    >
      <span>{{ roleStore.error }}</span>
      <Button @click="roleStore.error = null" class="ml-4 underline text-sm">
        Dismiss
      </Button>
    </div> -->

    <div>
      <RoleSkelton v-if="roleStore.loading" />

      <NotFound v-if="!roleStore.loading && roleStore.roles.length === 0" />
      <div
        v-if="!roleStore.loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        <Card
          v-for="role in roleStore.roles"
          :key="role.id"
          class="border p-5 rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
        >
          <div>
            <p class="text-sm text-muted-foreground mb-1">
              Total users: {{ role.users_count || 0 }}
            </p>
            <h3 class="text-xl font-semibold text-gray-900">{{ role.name }}</h3>
          </div>

          <div
            v-if="canUpdateRole || canDeleteRole"
            class="flex space-x-2 mt-4"
          >
            <Button
              v-if="canUpdateRole"
              @click="openEditModal(role)"
              variant="outline"
              class="btn !bg-white !text-black"
              :disabled="loadingRoleId === role.id"
            >
              <span v-if="loadingRoleId !== role.id">Edit</span>
              <svg
                v-else
                class="animate-spin h-4 w-4 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                />
              </svg>
            </Button>
            <Button
              v-if="canDeleteRole"
              @click="deleteRole(role.id)"
              variant="destructive"
              class="btn"
            >
              Delete
            </Button>
          </div>
        </Card>
      </div>
    </div>
    <Pagination
      v-if="!roleStore.loading && roleStore.roles.length > 0"
      :current-page="currentPage"
      :last-page="totalPages"
      :total="totalItems"
      :per-page="pageSize"
      :from="roleStore.pagination.from"
      :to="roleStore.pagination.to"
      @page-change="handlePageChange"
    />

    <Dialog
      v-if="canCreateRole || canUpdateRole"
      :open="showModal"
      @update:open="closeModal"
    >
      <DialogContent class="sm:max-w-[825px] px-">
        <RoleModal
          :roleToEdit="selectedRole"
          :permissions="roleStore.all_permissions"
          :modules="roleStore.modules"
          @close="closeModal"
          @role-created="handleRoleCreated"
          @role-updated="handleRoleUpdated"
        />
      </DialogContent>
    </Dialog>

    <transition name="fade">
      <div
        v-if="toast.visible"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg z-50 text-sm"
      >
        {{ toast.message }}
      </div>
    </transition>
    </template>
    <ComponentPermissionError v-else />
  </PageLayout>
</template>

<script setup lang="ts">
import { useSearchQuary } from "@/composeable/userSearchQuary";
import { useRoleStore } from "@/store/common/role-permission-store";
import { computed, onMounted, reactive, ref, watch } from "vue";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageLayout from "@/layouts/components/PageLayout.vue";
import Pagination from "@/shared/components/Pagination.vue";
import ComponentPermissionError from "@/shared/components/ComponentPermissionError.vue";
import { PNComponentPermissions } from "@/constant/permission";
import { Plus } from "lucide-vue-next";
import NotFound from "./NotFound.vue";
import RoleModal from "./RoleModal.vue";
import RoleSkelton from "./RoleSkelton.vue";

const roleStore = useRoleStore();
const rolePermissions = PNComponentPermissions.RolesView;
const canViewRoles = computed(() =>
  roleStore.hasPermission(rolePermissions.view)
);
const canCreateRole = computed(() =>
  roleStore.hasPermission(rolePermissions.create)
);
const canUpdateRole = computed(() =>
  roleStore.hasPermission(rolePermissions.update)
);
const canDeleteRole = computed(() =>
  roleStore.hasPermission(rolePermissions.delete)
);

const showModal = ref(false);
const selectedRole = ref(null);
const loadingRoleId = ref<number | null>(null);

const toast = reactive({
  visible: false,
  message: "",
});

const {
  currentPage,
  pageSize,
  searchQuery,
  debouncedSearch,
  sortBy,

  buildApiParams,
  setPage,
  setPageSize,
  setSort,
  ready,
} = useSearchQuary();
const handlePageChange = setPage;
const handlePageSizeChange = setPageSize;
const handleSortChange = setSort;
watch([ready, debouncedSearch, sortBy, currentPage, pageSize], async () => {
  if (ready.value) await fetchRoles();
});

onMounted(() => {
  roleStore.fetchSignlePermissions();
  roleStore.fetchAllPermissionsWithModule();
});

const fetchRoles = async () => {
  await roleStore.fetchAllRoleIndex(buildApiParams());
};

const openAddModal = () => {
  selectedRole.value = null;
  showModal.value = true;
};

const openEditModal = async (role) => {
  loadingRoleId.value = role.id;
  try {
    const modules = await roleStore.fetchPermissionsByRoleId(role.id);
    const permissionIds = modules.flatMap((mod) =>
      mod.permissions.map((p) => p.id)
    );

    selectedRole.value = {
      id: role.id,
      name: role.name,
      permissions: permissionIds,
    };
    showModal.value = true;
  } finally {
    loadingRoleId.value = null;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedRole.value = null;
};

const showToast = (message: string) => {
  toast.message = message;
  toast.visible = true;
  setTimeout(() => (toast.visible = false), 3000);
};

const handleRoleCreated = (role) => {
  showToast(`Role "${role.name}" created successfully!`);
  fetchRoles();
};

const handleRoleUpdated = (role) => {
  showToast(`Role "${role.name}" updated successfully!`);
  fetchRoles();
};

const deleteRole = async (id: number) => {
  if (!canDeleteRole.value) return;
  if (!confirm("Are you sure you want to delete this role?")) return;
  try {
    await roleStore.deleteRole(id);
    showToast("Role deleted successfully!");

    if (roleStore.roles.length === 1 && currentPage.value > 1) {
      setPage(currentPage.value - 1);
    }
    fetchRoles();
  } catch (error) {
    console.error(error);
    alert("Failed to delete role.");
  }
};

const totalPages = computed(() => roleStore.pagination?.last_page || 1);
const totalItems = computed(() => roleStore.pagination?.total || 0);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
