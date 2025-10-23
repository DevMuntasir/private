import type { ApiResponse } from "@/types/common";
import { apiService } from "./api-service";
import type { Playlist, PlaylistPayload } from "@/types/playlist-type";


export const playlistService = {
  async create(payload: PlaylistPayload): Promise<ApiResponse<Playlist>> {
    return await apiService.post<Playlist>("/pns/playlists/store", payload);
  },

  async update(id: number, payload: PlaylistPayload): Promise<ApiResponse<Playlist>> {
    return await apiService.put<Playlist>(`/pns/playlists/${id}`, payload);
  },

  async getAllPlaylist(params: any = {}): Promise<ApiResponse<Playlist[]>> {
    return await apiService.get<Playlist[]>("/pns/playlists/index", {
      params,
    });
  },

  async getPlaylist(id: number): Promise<ApiResponse<Playlist>> {
    return await apiService.get<Playlist>(`/pns/playlists/${id}`);
  },

};
