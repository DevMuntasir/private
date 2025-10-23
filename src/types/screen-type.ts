export type ScreenPayload = {
  name: string;
  store_name: string;
  location_id: number;
  store_info: StoreInfo;
  screen_info: string[];
  status: 0 | 1;
  to_t_sc: number;
  m_co_s: number;
  a_to_t: number;
  string_screen_id:string
};
type StoreInfo = {
  type: "Fridge" | "Shelf" | "Other";
  system: "SimplePOS" | "AdvancedPOS" | "Other";
};

export type Screens = {
  id: number;
  name: string;
  store_name: string;
  admin_id: number;
  location: {
    id: number;
    name: string;
  };
  store_info: StoreInfo;
  screen_info: string[];
  to_t_sc: number;
  m_co_s: number;
  a_to_t: number;
  string_screen_id: string;
  status: {
    value: 0 | 1;
    label: string;
  };
  created_at: string;
  updated_at: string;
};

// Logs used for charts like AdPlaysGantt (ads mode)
export type ScreenVideoPlayLog = {
  screen_id: number;
  video: string;
  ad_id: number;
  // Use BD-local timestamp from API; treat as display authority
  played_at_bd: string;
  created_at: string;
  updated_at: string;
};

// Paginated response shape for screen video play logs
import type { PaginationLink } from "@/types/common";
export interface PaginatedScreenVideoPlayResponse {
  current_page: number;
  data: ScreenVideoPlayLog[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number | string;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
// src/types/screen-type.ts (Add if missing)
export interface ScreenStatusItem {
  screen_id: number;
  status: "online" | "offline";
  cpu_percent: string;
  ram_percent: string;
  ram_used_mb: number;
  ram_total_mb: number;
  disk_percent: string;
  disk_used_gb: string;
  disk_total_gb: string;
  reported_at: string;     // "2025-09-16 05:37:37+00"
  created_at: string;
  updated_at: string;
  reported_at_bd?: string; // optional: "2025-09-16 11:37:37"
}

export interface CursorScreenStatusResponse {
  data: ScreenStatusItem[];
  path: string;
  per_page: number;
  next_cursor?: string | null;
  next_page_url?: string | null;
  prev_cursor?: string | null;
  prev_page_url?: string | null;
}

// Cursor-based page for logs
import type { CursorPage } from "@/types/pagination";
export type CursorScreenVideoPlayResponse = CursorPage<ScreenVideoPlayLog>;

export type ScreenPlaylistConfirmation = {
  screen_id?: number | string | null;
  screen_name?: string | null;
  name?: string | null;
  playlist_id?: number | string | null;
  playlist?: ScreenPlaylistSummary[] | ScreenPlaylistSummary | null;
};

export type ScreenPlaylistSummary = {
    id?: number | string | null;
    name?: string | null;
};

