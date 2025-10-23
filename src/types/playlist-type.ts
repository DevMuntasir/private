import type { Status } from "./ad-types";

export interface PlaylistPayload {
  name: string;
  city?: number;
  location_ids: number[];
  ad_ids: number[];
  screenIds?: number[];
  screen_ids?: number[];
}

export interface PlaylistLocation {
  id: number;
  name: string;
  city_id?: number;
  city?: {
    id: number;
    name: string;
  };
}

export interface PlaylistCity {
  id: number;
  name: string;
}

export interface PlaylistAdSummary {
  id: number;
  name: string;
  video_url?: string | null;
  status?: Status | null;
}

export interface PlaylistScreenSummary {
  id: number;
  name: string;
  store_name?: string;
  location?: {
    id: number;
    name: string;
  } | null;
}

export interface Playlist extends Partial<PlaylistPayload> {
  id: number;
  name: string;
  status?: Status | null;
  created_at?: string;
  updated_at?: string;
  ads?: PlaylistAdSummary[];
  locations?: PlaylistLocation[];
  cities?: PlaylistCity[];
  screens?: PlaylistScreenSummary[];
}
