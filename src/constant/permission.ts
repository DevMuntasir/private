/**
 * Centralized permission keys for the PN dashboard (synced to PHP).
 * The string literals MUST match backend ability names exactly.
 */
export const PN_PERMISSION_MAP = {
  // PN Users
  PN_USER_ACCESS: 'access_pn_user',
  PN_USER_CREATE: 'create_pn_user',
  PN_USER_VIEW: 'view_pn_user',
  PN_USER_UPDATE: 'update_pn_user',
  PN_USER_DELETE: 'delete_pn_user',

  // PN Roles
  PN_ROLE_ACCESS: 'access_pn_role',
  PN_ROLE_CREATE: 'create_pn_role',
  PN_ROLE_VIEW: 'view_pn_role',
  PN_ROLE_UPDATE: 'update_pn_role',
  PN_ROLE_DELETE: 'delete_pn_role',

  // Playlists
  PLAYLIST_ACCESS: 'access_playlist',
  PLAYLIST_CREATE: 'create_playlist',
  PLAYLIST_VIEW: 'view_playlist',
  PLAYLIST_UPDATE: 'update_playlist',
  PLAYLIST_DELETE: 'delete_playlist',

  // Ads
  AD_ACCESS: 'access_ad',
  AD_CREATE: 'create_ad',
  AD_VIEW: 'view_ad',
  AD_UPDATE: 'update_ad',
  AD_DELETE: 'delete_ad',

  // Country
  COUNTRY_ACCESS: 'access_country',
  COUNTRY_VIEW: 'view_country',
  COUNTRY_CREATE: 'create_country',
  COUNTRY_UPDATE: 'update_country',
  COUNTRY_DELETE: 'delete_country',

  // City
  CITY_ACCESS: 'access_city',
  CITY_VIEW: 'view_city',
  CITY_CREATE: 'create_city',
  CITY_UPDATE: 'update_city',
  CITY_DELETE: 'delete_city',

  // State
  STATE_ACCESS: 'access_state',
  STATE_VIEW: 'view_state',
  STATE_CREATE: 'create_state',
  STATE_UPDATE: 'update_state',
  STATE_DELETE: 'delete_state',

  // Locations
  LOCATION_ACCESS: 'access_location',
  LOCATION_VIEW: 'view_location',
  LOCATION_CREATE: 'create_location',
  LOCATION_UPDATE: 'update_location',
  LOCATION_DELETE: 'delete_location',

  // Screens
  SCREEN_ACCESS: 'access_screen',
  SCREEN_VIEW: 'view_screen',
  SCREEN_CREATE: 'create_screen',
  SCREEN_UPDATE: 'update_screen',
  SCREEN_DELETE: 'delete_screen',
} as const;

export const PNPermissionServiceConstant = PN_PERMISSION_MAP;
export const ClientPermissionServiceConstant = PN_PERMISSION_MAP;

export type PNPermissionKey = keyof typeof PN_PERMISSION_MAP;
export type PNPermission = typeof PN_PERMISSION_MAP[PNPermissionKey];

/**
 * Optional: Route and component permission maps trimmed to entities present in PHP.
 * Keep or remove as needed in your app.
 */

// ----------------------
// Route-based permissions
// ----------------------
export const PNRoutePermissions = {
  Users: [PN_PERMISSION_MAP.PN_USER_VIEW],
  RolesPermissions: [PN_PERMISSION_MAP.PN_ROLE_VIEW],
  Playlists: [PN_PERMISSION_MAP.PLAYLIST_VIEW],
  Ads: [PN_PERMISSION_MAP.AD_VIEW],
  Countries: [PN_PERMISSION_MAP.COUNTRY_VIEW],
  Cities: [PN_PERMISSION_MAP.CITY_VIEW],
  States: [PN_PERMISSION_MAP.STATE_VIEW],
  Locations: [PN_PERMISSION_MAP.LOCATION_VIEW],
  Screens: [PN_PERMISSION_MAP.SCREEN_VIEW],
} as const;

export type PNRouteName = keyof typeof PNRoutePermissions;
export type PNRoutePermissionMap = typeof PNRoutePermissions;

// ----------------------
// Component-based permissions
// ----------------------
export const PNComponentPermissions = {
  UserTable: {
    view: PN_PERMISSION_MAP.PN_USER_VIEW,
    create: PN_PERMISSION_MAP.PN_USER_CREATE,
    update: PN_PERMISSION_MAP.PN_USER_UPDATE,
    delete: PN_PERMISSION_MAP.PN_USER_DELETE,
  },
  RolesView: {
    view: PN_PERMISSION_MAP.PN_ROLE_VIEW,
    create: PN_PERMISSION_MAP.PN_ROLE_CREATE,
    update: PN_PERMISSION_MAP.PN_ROLE_UPDATE,
    delete: PN_PERMISSION_MAP.PN_ROLE_DELETE,
  },
  PlaylistTable: {
    view: PN_PERMISSION_MAP.PLAYLIST_VIEW,
    create: PN_PERMISSION_MAP.PLAYLIST_CREATE,
    update: PN_PERMISSION_MAP.PLAYLIST_UPDATE,
    delete: PN_PERMISSION_MAP.PLAYLIST_DELETE,
  },
  AdsTable: {
    view: PN_PERMISSION_MAP.AD_VIEW,
    create: PN_PERMISSION_MAP.AD_CREATE,
    update: PN_PERMISSION_MAP.AD_UPDATE,
    delete: PN_PERMISSION_MAP.AD_DELETE,
  },
  CountryTable: {
    view: PN_PERMISSION_MAP.COUNTRY_VIEW,
    create: PN_PERMISSION_MAP.COUNTRY_CREATE,
    update: PN_PERMISSION_MAP.COUNTRY_UPDATE,
    delete: PN_PERMISSION_MAP.COUNTRY_DELETE,
  },
  CityTable: {
    view: PN_PERMISSION_MAP.CITY_VIEW,
    create: PN_PERMISSION_MAP.CITY_CREATE,
    update: PN_PERMISSION_MAP.CITY_UPDATE,
    delete: PN_PERMISSION_MAP.CITY_DELETE,
  },
  StateTable: {
    view: PN_PERMISSION_MAP.STATE_VIEW,
    create: PN_PERMISSION_MAP.STATE_CREATE,
    update: PN_PERMISSION_MAP.STATE_UPDATE,
    delete: PN_PERMISSION_MAP.STATE_DELETE,
  },
  LocationTable: {
    view: PN_PERMISSION_MAP.LOCATION_VIEW,
    create: PN_PERMISSION_MAP.LOCATION_CREATE,
    update: PN_PERMISSION_MAP.LOCATION_UPDATE,
    delete: PN_PERMISSION_MAP.LOCATION_DELETE,
  },
  ScreenTable: {
    view: PN_PERMISSION_MAP.SCREEN_VIEW,
    create: PN_PERMISSION_MAP.SCREEN_CREATE,
    update: PN_PERMISSION_MAP.SCREEN_UPDATE,
    delete: PN_PERMISSION_MAP.SCREEN_DELETE,
  },
  ScreenReportTable: {
    view: PN_PERMISSION_MAP.SCREEN_VIEW,
    update: PN_PERMISSION_MAP.SCREEN_UPDATE,
  },
  Navigation: {
    users: PN_PERMISSION_MAP.PN_USER_ACCESS,
    roles: PN_PERMISSION_MAP.PN_ROLE_ACCESS,
    playlists: PN_PERMISSION_MAP.PLAYLIST_ACCESS,
    ads: PN_PERMISSION_MAP.AD_ACCESS,
    countries: PN_PERMISSION_MAP.COUNTRY_ACCESS,
    cities: PN_PERMISSION_MAP.CITY_ACCESS,
    states: PN_PERMISSION_MAP.STATE_ACCESS,
    locations: PN_PERMISSION_MAP.LOCATION_ACCESS,
    screens: PN_PERMISSION_MAP.SCREEN_ACCESS,
    accounts: PN_PERMISSION_MAP.PN_USER_ACCESS,
    settings: PN_PERMISSION_MAP.PN_USER_UPDATE,
  },
} as const;

export type PNComponentPermissionKey = keyof typeof PNComponentPermissions;
export type PNComponentPermissionMap = typeof PNComponentPermissions;

export const AdminComponentPermissions = PNComponentPermissions;
