import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordNormalized } from "vue-router";
import { useAuthStore } from "@/store/auth-store";
import { useRoleStore } from "../store/common/role-permission-store";

function isPublicRoute(to: RouteLocationNormalized): boolean {
  return to.matched.some((record) => record.meta?.public === true);
}

function requiresAuthentication(to: RouteLocationNormalized): boolean {
  return to.matched.some((record) => record.meta?.requiresAuth === true);
}

function resolvePermissionMeta(
  to: RouteLocationNormalized
): string[] | undefined {
  const matchWithPermissions = [...to.matched]
    .reverse()
    .find((record: RouteRecordNormalized) => record.meta?.permissions);

  return matchWithPermissions?.meta?.permissions as string[] | undefined;
}

function redirectToDashboard(next: NavigationGuardNext) {
  return next({ name: "Overview" });
}

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  const permissionStore = useRoleStore();

  const isPublic = isPublicRoute(to);
  const needsAuth = requiresAuthentication(to);
  const requiredPermissions = resolvePermissionMeta(to);

  if (needsAuth && !auth.isAuthenticated) {
    return next({ name: "Login" });
  }

  if (auth.isAuthenticated) {
    if (!auth.is_verified) {
      const allowedPublicRoutes = new Set(["Login", "Signup"]);
      if (!allowedPublicRoutes.has(String(to.name))) {
        return next({ name: "Login" });
      }
    } else {
      if (to.name === "Root") {
        return redirectToDashboard(next);
      }
      if (isPublic) {
        if (to.name !== "Overview") {
          return redirectToDashboard(next);
        }
      }
    }
  }

  if (needsAuth && auth.isAuthenticated && requiredPermissions?.length) {
    if (!permissionStore.permissionLoaded) {
      permissionStore.fetchSignlePermissions().then(() => {
        authGuard(to, from, next);
      });
      return;
    }

    const hasPermission = permissionStore.hasAnyPermission(
      requiredPermissions
    );
    if (!hasPermission) {
      debugger
       return next({ name: "NoPermission" });
    }
  }

  return next();
}
