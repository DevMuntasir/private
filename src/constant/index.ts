// { label: 'Overview', path: '/overview', icon: 'overview', roles: ['admin', 'editor', 'viewer'] },

import {
  BetweenHorizontalStart,
  Columns3Cog,
  Contact,
  FolderCog,
  LayoutDashboard,
  LucideClockAlert,
  MapPin,
  Megaphone,
  PlayCircle,
  PlaySquare,
  // PersonStanding,
  Receipt,
  Settings2,
  Smartphone,
  User,
  UserLock,
  UsersRound,
} from "lucide-vue-next";
import { PNComponentPermissions } from "./permission";

export const REDIRECT_AFTER_LOGIN = "/private/overview";
export const USER_REDIRECT_AFTER_REGISTER = "/private/auth/login";
export const LOGIN = "/auth/private/login";
export const REGISTER = "/auth/private/signup";
export const LOGOUT = "/pns/users/logout"

export const ADMIN_SIDEBAR = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/logo/icon.svg",
  },
  teams: [
    {
      name: "Client",
      logo: "/logo/icon.svg",
      plan: "Client",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/private/overview",
      icon: LayoutDashboard,
      isActive: true,
    },
   
    
    // {
    //   title: "Clients",
    //   url: "/private/clients",
    //   icon: Contact,
    //   // permissionName: AdminComponentPermissions.Navigation.clients,
    // },
      
    {
      title: "Ads",
      url: "/private/ads",
      icon: BetweenHorizontalStart,
      permissionName: PNComponentPermissions.Navigation.ads,
    },
    {
      title: "Playlists",
      url: "/private/playlists",
      icon: PlaySquare,
      permissionName: PNComponentPermissions.Navigation.playlists,
    },
    {
      title: "Screens",
      url: "/private/screens",

      icon: Smartphone,
      permissionName: PNComponentPermissions.Navigation.screens,
    },
    {
      title: "Locations",
      url: "/private/locations",
      icon: MapPin,
      permissionName: PNComponentPermissions.Navigation.locations,
    },
    {
      title: "Billing",
      url: "/private/billings",
      icon: Receipt,
      // permissionName: AdminComponentPermissions.Navigation.billings,
    },
    // {
    //   title: "Account",
    //   url: "/admin/accounts",
    //   icon: Columns3Cog,
    // },
    // {
    //   title: "Account",
    //   url: "/admin/account",

    //   icon: User,
    // },
    {
      title: "Roles & Permissions",
      url: "/private/roles-permissions",
      icon: UserLock,
      permissionName: PNComponentPermissions.Navigation.roles,
    },
    {
      title: "Users",
      url: "/private/users",
      icon: User,
      permissionName: PNComponentPermissions.Navigation.users,
    },
    {
      title: "Settings",
      url: "/private/settings",
      icon: Settings2,
      permissionName: PNComponentPermissions.Navigation.settings,
    },
    
  ],
  users: [
    {
      name: "Roles & Permissions",
      url: "/private/roles",
      icon: LucideClockAlert,
    },
    {
      name: "Users",
      url: "/private/users",
      icon: User,
    },
    {
      name: "Settings",
      url: "/private/settings",
      icon: Settings2,
    },
  ],
};

export const PartnerMenu = [
  { label: "Overview", path: "/overview", icon: "overview" },
  { label: "Account Manager", path: "/campaigns", icon: "campaigns" },
  { label: "Partners", path: "Partners", icon: "ads" },
  { label: "Clients", path: "Clients", icon: "accounts" },
  { label: "Screens", path: "Screens", icon: "billing" },
  { label: "Billing", path: "Billing", icon: "billing" },
  { label: "Account", path: "Account", icon: "billing" },
];
