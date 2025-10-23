import { defineStore } from "pinia";
import type { PaginationResponse } from "@/types/pagination";
import { playlistService } from "@/services/playlist-service";

export const usePlaylistStore = defineStore("playlist", {
  state: () => ({
    loading: false,
    success: false,
    error: null as string | null,
    playlist: [] as any[],
    pagination: null as PaginationResponse | null,
    message: ''
  }),

  actions: {
    resetState() {
      this.loading = false;
      this.success = false;
      this.error = null;
    },

    async fetchAllPlaylistIndex(params: any = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.per_page) queryParams.append("show", params.per_page.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);
        if (params.sort_by && params.sort_order) {
          queryParams.append("sort[0][field]", params.sort_by);
          queryParams.append("sort[0][direction]", params.sort_order);
        }

        const response = await playlistService.getAllPlaylist(queryParams);

        this.playlist = response.data;
        this.pagination = {
          current_page: response.meta.current_page,
          last_page: response.meta.last_page,
          per_page: response.meta.per_page,
          total: response.meta.total,
          next_page_url: response.links.next,
          prev_page_url: response.links.prev,
          from: response.meta.from,
          to: response.meta.to,
        };
      } catch (e: any) {
        this.error = e?.message || "Failed to load playlists";
      } finally {
        this.loading = false;
      }
    },
  },
});
