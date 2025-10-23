<template>
  <div class="p-4 space-y-4">
    <template v-if="canViewUsers">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Select v-model="pageSize">
          <SelectTrigger
            class="w-[120px] font-primary !h-[43px] rounded-[3px] bg-white"
          >
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Per Page</SelectLabel>
            <SelectItem v-for="size in [1, 2, 3]" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          v-model="searchQuery"
          placeholder="Search User"
          class="!w-[300px] form-input"
        />
      </div>

      <div class="flex items-center space-x-2">
        <Dialog v-if="canCreateUser" v-model:open="isModalOpen">
          <DialogTrigger as-child>
            <Button class="btn" @click="openCreateUser">+ Add New User</Button>
          </DialogTrigger>
          <DialogContent class="p-0">
            <UserCreate
              :user-to-edit="userToEdit"
              :isEdit="isEdit"
              @close="onClose"
              @created="fetchUsers"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <div class="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow class="bg-primary-foreground">
            <TableHead
              class="cursor-pointer max-w-[350px]"
              @click="handleSort('name')"
            >
              User
              <span v-if="sortBy.startsWith('name')">
                {{ sortBy.endsWith("asc") ? "↑" : "↓" }}
              </span>
            </TableHead>
            <TableHead>Assigned Roles</TableHead>
            <TableHead class="cursor-pointer" @click="handleSort('email')">
              Email
              <span v-if="sortBy.startsWith('email')">
                {{ sortBy.endsWith("asc") ? "↑" : "↓" }}
              </span>
            </TableHead>
            <TableHead class="cursor-pointer" @click="handleSort('phone')">
              Phone
              <span v-if="sortBy.endsWith('asc')">↑</span>
              <span v-else>↓</span>
            </TableHead>

            <TableHead
              v-if="canUpdateUser || canDeleteUser"
              class="text-right pr-5"
            >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="!loading">
            <TableRow
              v-for="user in userStore?.users"
              :key="user.id"
              :class="selectedUsers.includes(user.id) ? 'bg-muted/50' : ''"
            >
              <TableCell>
                <div class="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      :src="user.profile_image || ''"
                      alt="@unovue"
                    />
                    <AvatarFallback>US</AvatarFallback></Avatar
                  >
                  <div>
                    <p class="font-medium text-left">{{ user.name }}</p>
                    <p class="text-sm text-muted-foreground text-left">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell
                class="flex flex-wrap gap-1 items-center h-full !border-b-0"
              >
                <Badge
                  v-for="role in user.roles"
                  :key="role.id"
                  :class="getRoleBadgeColor(role.name)"
                >
                  {{ role.name }}
                </Badge>
              </TableCell>
              <TableCell class="text-left">{{ user.email }}</TableCell>
              <TableCell class="text-left">{{ user.phone }}</TableCell>

              <TableCell class="text-right" v-if="canUpdateUser || canDeleteUser">
                <div class="flex justify-end space-x-2">
                  <Button
                    v-if="canDeleteUser"
                    variant="ghost"
                    size="icon"
                    @click="confirmDeleteUser(user.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                  <Button
                    v-if="canUpdateUser"
                    variant="outline"
                    @click="openEditUser(user)"
                  >
                    <Pencil />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <TableSkelton v-if="loading" :rows="pageSize" :columns="6" />
    </div>
    <ConfirmDelete
      :open="isDeleteModalOpen"
      title="Confirm Delete"
      description="Are you sure you want to delete this user? This action cannot be undone."
      @update:open="isDeleteModalOpen = $event"
      @cancel="isDeleteModalOpen = false"
      @confirm="deleteUserConfirmed"
    />

    <Pagination
      v-if="userStore.users.length > 0"
      :current-page="currentPage"
      :last-page="userStore.pagination?.last_page || 1"
      :total="userStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="userStore.pagination?.from || 1"
      :to="userStore.pagination?.to"
      @page-change="setPage"
    />
    </template>
    <ComponentPermissionError v-else />
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";

import UserCreate from "../user.create/UserCreate.vue";

import { useRoleColor } from "@/composeable/useRoleColor";
import { useSearchQuary } from "@/composeable/userSearchQuary";
import { userService } from "@/services/user-service";
import ConfirmDelete from "@/shared/components/ConfirmDelete.vue";
import Pagination from "@/shared/components/Pagination.vue";
import TableSkelton from "@/shared/components/TableSkelton.vue";
import ComponentPermissionError from "@/shared/components/ComponentPermissionError.vue";
import { PNComponentPermissions } from "@/constant/permission";
import { useRoleStore } from "@/store/common/role-permission-store";
import { useUserStore } from "@/store/user-store";

const userStore = useUserStore();
const roleStore = useRoleStore();
const { getRoleBadgeColor } = useRoleColor();
const userPermissions = PNComponentPermissions.UserTable;
const canViewUsers = computed(() =>
  roleStore.hasPermission(userPermissions.view)
);
const canCreateUser = computed(() =>
  roleStore.hasPermission(userPermissions.create)
);
const canUpdateUser = computed(() =>
  roleStore.hasPermission(userPermissions.update)
);
const canDeleteUser = computed(() =>
  roleStore.hasPermission(userPermissions.delete)
);

const {
  searchQuery,
  debouncedSearch,
  currentPage,
  pageSize,
  sortBy,
  buildApiParams,
  setPage,
  setSort,
} = useSearchQuary();

const isModalOpen = ref(false);
const isEdit = ref(false);
const userToEdit = ref(null);

const loading = ref(false);
const selectedUsers = ref<number[]>([]);

const isDeleteModalOpen = ref(false);
const userToDelete = ref<number | null>(null);

const openCreateUser = () => {
  if (!canCreateUser.value) return;
  isEdit.value = false;
  userToEdit.value = null;
  isModalOpen.value = true;
};
//eslint-disable-next-line
const openEditUser = (user: any) => {
  if (!canUpdateUser.value) return;
  isEdit.value = true;
  userToEdit.value = user;
  isModalOpen.value = true;
};

const onClose = () => {
  isModalOpen.value = false;
  isEdit.value = false;
  userToEdit.value = null;
};

function confirmDeleteUser(id: number) {
  if (!canDeleteUser.value) return;
  userToDelete.value = id;
  isDeleteModalOpen.value = true;
}

async function deleteUserConfirmed() {
  if (userToDelete.value === null || !canDeleteUser.value) return;
  try {
    await userService.delete(userToDelete.value);
    fetchUsers();
  } finally {
    isDeleteModalOpen.value = false;
    userToDelete.value = null;
  }
}

const handleSort = (field: string) => {
  const [currField, currDir] = sortBy.value.split(":");
  const nextDir = currField === field && currDir === "asc" ? "desc" : "asc";
  setSort(`${field}:${nextDir}`);
};

const fetchUsers = async () => {
  if (!canViewUsers.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    await userStore.fetchAllUserIndex(buildApiParams());
  } finally {
    loading.value = false;
  }
};

watch([debouncedSearch, currentPage, pageSize, sortBy], fetchUsers);
watch(canViewUsers, (hasAccess) => {
  if (hasAccess && userStore.users.length === 0) {
    fetchUsers();
  }
});

onMounted(() => {
  fetchUsers();
  roleStore.fetchAllRoleIndex();
});
</script>
