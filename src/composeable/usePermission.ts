import { computed } from "vue";

import { ClientPermissionServiceConstant } from "@/constant/permission";
import { useRoleStore } from "@/store/common/role-permission-store";

export function usePermission() {
  const permissionStore = useRoleStore();

  const userPermissions = computed(() => {
    permissionStore.fetchSignlePermissions();
    console.log(permissionStore.all_permissions);

    if (!permissionStore.all_permissions) return [];

    return permissionStore.all_permissions.flatMap((module) =>
      module.permissions.map((p) => p.name)
    );
  });

  const hasPermission = (permission: string) => {
    console.log(permission);

    return userPermissions.value.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]) => {
    console.log(permissions);

    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: ClientPermissionServiceConstant,
  };
}
