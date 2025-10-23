import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { authGuard } from "./guard";
import authRoutes from "./auth-routes";
import { getActivePinia } from "pinia";
import { useRouteLoaderStore } from "@/store/common/route-loader-store";
import routers from "./routes";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Root",
    meta: { public: true },
    redirect: { name: "Login" },
  },

  ...routers,
  ...authRoutes,

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: { public: true },
    component: () => import("../shared/components/NotFound.vue"),
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const activePinia = getActivePinia();
  if (activePinia) {
    const loaderStore = useRouteLoaderStore(activePinia);
    const isPublic = to.matched.some((record) => record.meta?.public === true);
    if (isPublic) {
      loaderStore.reset();
    } else {
      loaderStore.start();
    }
  }
  next();
});

router.beforeEach(authGuard);

router.afterEach(() => {
  const activePinia = getActivePinia();
  if (activePinia) {
    useRouteLoaderStore(activePinia).completeNavigation();
  }
});

router.onError(() => {
  const activePinia = getActivePinia();
  if (activePinia) {
    useRouteLoaderStore(activePinia).reset();
  }
});

export default router;

