import { Playlist } from "./playlist-type";

export interface Audience {
  gender: string;
  age_group: number | string;
}

export interface AdPayload {
  name: string;
  campaign_id: string;
  video_url?: File;
  audiences: Audience[];
}

export interface Ad {
  id?: number;
  name: string;
 goal: {
      value:1,
      label:string
    };
  video_url: string;
  out_url: string;
  template_id: string;
  qr_path: string;
  playlists:Playlist[]
}

export interface AdResponse {
  id: number;
  name: string;
  message?: string;
  video_url: string;
  out_url:string;
  qr_path:string;
  status: Status;
  created_at: string;
  template_id: number;
    goal: {
      value:1,
      label:string
    };
    
}

export interface AdPlaylistScreenSummary {
  id: number;
  name: string;
}

export interface AdPlaylistSummary {
  id: number;
  name: string;
  screens?: AdPlaylistScreenSummary[];
  screens_count?: number;
}

export interface AdDetailResponse extends AdResponse {
  playlists?: AdPlaylistSummary[];
}
export interface QrResponse {
  qr_path: string;
}

export interface AudienceResponse {
  gender: {
    value: string;
    label: string;
  };
  age_group: {
    value: number;
    label: string;
  };
}

export interface Status {
  value: number;
  label: string;
}
