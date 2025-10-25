import type { RouteRecordRaw } from "vue-router";
import { PN_PERMISSION_MAP } from "@/constant/permission";

const routers: RouteRecordRaw[] = [
  {
    path: "/private",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: { name: "Overview" } },
      {
        path: "overview",
        name: "Overview",
        component: () => import("../views/dashboard/overview/Overview.vue"),
      },
      {
        path: "locations",
        name: "locations",
        component: () =>
          import("../views/dashboard/location/LocationLayout.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.LOCATION_ACCESS],
        },
        children: [
          {
            path: "",
            component: () =>
              import("../views/dashboard/location/Location.vue"),
          },
          {
            path: "create-location",
            name: "create-location",
            component: () =>
              import("../views/dashboard/location/CreateLocation.vue"),
            meta: {
              permissions: [PN_PERMISSION_MAP.LOCATION_CREATE],
            },
          },
        ],
      },
      {
        path: "screens",
        name: "Screens",
        component: () =>
          import("../views/dashboard/screens/ScreenLayout.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.SCREEN_ACCESS],
        },
        children: [
          {
            path: "",
            component: () =>
              import("../views/dashboard/screens/Screen.vue"),
          },
          {
            path: "create",
            name: "screen-create",
            component: () =>
              import("../views/dashboard/screens/ScreenCreate.vue"),
            meta: {
              permissions: [PN_PERMISSION_MAP.SCREEN_CREATE],
            },
          },
        ],
      },
      {
        path: "roles-permissions",
        name: "RolesPermissions",
        component: () =>
          import("../views/dashboard/users/roles/Roles.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.PN_ROLE_ACCESS],
        },
      },
      {
        path: "ads",
        name: "ads",
        component: () => import("../views/dashboard/ads/Ads.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.AD_ACCESS],
        },
      },
      {
        path: "prescriptions",
        name: "Prescriptions",
        component: () =>
          import("../views/dashboard/medical/PrescriptionComposer.vue"),
      },
      {
        path: "ads/create",
        name: "AdCreate",
        component: () =>
          import("../views/dashboard/ads/CreateAd.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.AD_CREATE],
        },
      },
      {
        path: "ads/edit/:id",
        name: "AdEdit",
        component: () => import("../views/dashboard/ads/AdEdit.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.AD_UPDATE],
        },
      },
      {
        path: "playlists",
        name: "playlists",
        component: () =>
          import("../views/dashboard/playlist/Playlist.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.PLAYLIST_ACCESS],
        },
      },
      {
        path: "playlists/:id",
        name: "playlist-details",
        component: () =>
          import("../views/dashboard/playlist/PlaylistDetails.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.PLAYLIST_VIEW],
        },
      },
      {
        path: "accounts",
        name: "accounts",
        component: () =>
          import("../views/dashboard/account/AccountLayout.vue"),
        // meta: {
        //   permissions: [PN_PERMISSION_MAP.],
        // },
        children: [
          {
            path: "",
            component: () =>
              import("../views/dashboard/account/account.vue"),
          },
        ],
      },
      {
        path: "users",
        name: "Users",
        component: () =>
          import("../views/dashboard/users/user.list/Users.vue"),
        meta: {
          permissions: [PN_PERMISSION_MAP.PN_USER_ACCESS],
        },
      },
      {
        path: "settings",
        component: () =>
          import("../views/dashboard/settings/SettingsLayout.vue"),
        // meta: {
        //   permissions: [PN_PERMISSION_MAP.PN_USER_UPDATE],
        // },
        children: [
          { path: "", redirect: "/admin/settings/password" },
          {
            path: "password",
            component: () =>
              import("../views/dashboard/settings/Password.vue"),
          },
          {
            path: "profile",
            component: () =>
              import("../views/dashboard/settings/Profile.vue"),
          },
        ],
      },
      {
    path: "/no-permission",
    name: "NoPermission",
  
    component: () => import("../shared/components/PermissionError.vue"),
  },
    ],
    
  },
  
];

export default routers;
