import { screenService } from "@/services/screen-service";
import { PaginationResponse } from "@/types/pagination";
import { CursorScreenVideoPlayResponse, Screens, ScreenVideoPlayLog } from "@/types/screen-type";
import { defineStore } from "pinia";
export const useScreenStore = defineStore("screen", {
  state: () => ({
    loading: false,
    error: null as string | null,
    success: false,
    screens: [] as Screens[],
    location_screens:[]as any[],
    screenVideoPlayData: [] as ScreenVideoPlayLog[],
    hasMoreLogs: true,
    screenLogsNextCursor: null as string | null,
    screenLogsNextPageUrl: null as string | null,
    screenLogsPrevCursor: null as string | null,
    screenLogsPrevPageUrl: null as string | null,
    filterFromDateTime: null as string | null,
    filterToDateTime: null as string | null,
    screenLogsPage: 0,
    screenLogsLastPage: 0,
    screenLogsPerPage: 0,
    _logsPollTimer: null as any,
    pagination: null as PaginationResponse | null,
    message:'',
    activeLocationRequestToken: null as symbol | null,
  }),

  actions: {
    async fetchAllScreenIndex(params: any = {}) {
      this.loading = true;
      this.error = null;
      try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.status ) queryParams.append("status", params.status.toString());
        if (params.per_page)
          queryParams.append("show", params.per_page.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.sort_by && params.sort_order) {
          queryParams.append("sort[0][field]", params.sort_by);
          queryParams.append("sort[0][direction]", params.sort_order);
        }

        const response = await screenService.getAllScreen(queryParams);

        this.screens = response.data;
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
      } catch (e) {
        this.error =
          e instanceof Error ? e.message : "Failed to load screens";
      } finally {
        this.loading = false;
      }
    },

    async fetchScreensByLocation(locationIds: number[] = []) {
      const requestToken = Symbol("fetchScreensByLocation");
      this.activeLocationRequestToken = requestToken;
      this.loading = true;
      this.error = null;

      if (!Array.isArray(locationIds) || locationIds.length === 0) {
        this.location_screens = [];
        this.pagination = null;
        this.loading = false;
        this.activeLocationRequestToken = null;
        return [];
      }

      try {
        const response = await screenService.getScreensByLocation(locationIds);
        if (this.activeLocationRequestToken !== requestToken) {
          return [];
        }

        const screens = Array.isArray(response.data) ? response.data : [];
        this.screens = screens;
        this.pagination = null;
        return screens;
      } catch (e) {
        if (this.activeLocationRequestToken === requestToken) {
          this.error =
            e instanceof Error
              ? e.message
              : "Failed to load screens for the selected locations";
          this.screens = [];
          this.pagination = null;
        }
        throw e;
      } finally {
        if (this.activeLocationRequestToken === requestToken) {
          this.loading = false;
          this.activeLocationRequestToken = null;
        }
      }
    },

    async fetchScreenDetailsByScreenId(screenId:number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await screenService.getScreenDetails(screenId);
        return response.data
      } catch (e) {
        this.error =
          e instanceof Error ? e.message : "Failed to load screens";
      } finally {
        this.loading = false;
      }
    },
    resetScreenVideoPlayData() {
      this.screenVideoPlayData = [];
      this.hasMoreLogs = true;
      this.screenLogsNextCursor = null;
      this.screenLogsNextPageUrl = null;
      this.screenLogsPrevCursor = null;
      this.screenLogsPrevPageUrl = null;
    },
    setDateRange(fromDateTime: string | null, toDateTime: string | null) {
      this.filterFromDateTime = fromDateTime;
      this.filterToDateTime = toDateTime;
    },
    clearDateRange() {
      this.filterFromDateTime = null;
      this.filterToDateTime = null;
    },
    async fetchScreenVideoPlayData(screenId: string | number, params: { per_page?: number } = {}) {
      const id = String(screenId);
      this.loading = true;
      this.error = null;
      try {
        const response = await screenService.getScreenVideoPlayDataCursor(id, {
          per_page: params.per_page,
          fromDateTime: this.filterFromDateTime,
          toDateTime: this.filterToDateTime,
        });
        const payload = response.data as CursorScreenVideoPlayResponse;
        this.screenVideoPlayData = payload.data ?? [];
        this.screenLogsPerPage = Number(payload.per_page ?? 0);
        this.screenLogsNextCursor = payload.next_cursor ?? null;
        this.screenLogsNextPageUrl = payload.next_page_url ?? null;
        this.screenLogsPrevCursor = payload.prev_cursor ?? null;
        this.screenLogsPrevPageUrl = payload.prev_page_url ?? null;
        this.hasMoreLogs = !!(payload.next_cursor || payload.next_page_url);
        return payload.data ?? [];
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load screen chart data";
        return [] as ScreenVideoPlayLog[];
      } finally {
        this.loading = false;
      }
    },
    async fetchScreenVideoPlayDataMore(screenId: string | number, params: { per_page?: number } = {}) {
      const id = String(screenId);
      if (!this.hasMoreLogs || (!this.screenLogsNextCursor && !this.screenLogsNextPageUrl)) return [] as ScreenVideoPlayLog[];
      this.loading = true;
      this.error = null;
      try {
        let cursor = this.screenLogsNextCursor;
        if (!cursor && this.screenLogsNextPageUrl) {
          try { const u = new URL(this.screenLogsNextPageUrl); cursor = u.searchParams.get('cursor'); } catch {}
        }
        const response = await screenService.getScreenVideoPlayDataCursor(id, {
          cursor,
          per_page: params.per_page,
          fromDateTime: this.filterFromDateTime,
          toDateTime: this.filterToDateTime,
        });
        const payload = response.data as CursorScreenVideoPlayResponse;
        const incoming = payload.data ?? [];
        // Append and de-duplicate by a simple key
        const existing = this.screenVideoPlayData;
        const seen = new Set(existing.map((p) => `${p.ad_id}|${p.video}|${(p as any).played_at_bd}`));
        for (const p of incoming) {
          const key = `${p.ad_id}|${p.video}|${(p as any).played_at_bd}`;
          if (!seen.has(key)) {
            existing.push(p);
            seen.add(key);
          }
        }
        this.screenVideoPlayData = existing;
        this.screenLogsPerPage = Number(payload.per_page ?? this.screenLogsPerPage);
        this.screenLogsNextCursor = payload.next_cursor ?? null;
        this.screenLogsNextPageUrl = payload.next_page_url ?? null;
        this.screenLogsPrevCursor = payload.prev_cursor ?? this.screenLogsPrevCursor;
        this.screenLogsPrevPageUrl = payload.prev_page_url ?? this.screenLogsPrevPageUrl;
        this.hasMoreLogs = !!(payload.next_cursor || payload.next_page_url);
        return incoming;
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load more screen chart data";
        return [] as ScreenVideoPlayLog[];
      } finally {
        this.loading = false;
      }
    },

    // Fetch latest page (page=1) and merge any new items at the head without losing older pages
    async refreshScreenVideoPlayHead(screenId: string | number, params: { per_page?: number } = {}) {
      const id = String(screenId);
      try {
        const response = await screenService.getScreenVideoPlayDataCursor(id, { per_page: params.per_page });
        const payload = response.data as CursorScreenVideoPlayResponse;
        const head = payload.data ?? [];
        if (!head.length) return [] as ScreenVideoPlayLog[];

        const existing = this.screenVideoPlayData;
        const seen = new Set(existing.map((p) => `${p.ad_id}|${p.video}|${(p as any).played_at_bd}`));
        const toPrepend: ScreenVideoPlayLog[] = [];
        for (const p of head) {
          const key = `${p.ad_id}|${p.video}|${(p as any).played_at_bd}`;
          if (!seen.has(key)) {
            toPrepend.push(p);
            seen.add(key);
          }
        }
        if (toPrepend.length) {
          this.screenVideoPlayData = [...toPrepend, ...existing];
        }

        // Update cursors/meta
        this.screenLogsPerPage = Number(payload.per_page ?? this.screenLogsPerPage);
        this.screenLogsNextCursor = payload.next_cursor ?? this.screenLogsNextCursor;
        this.screenLogsNextPageUrl = payload.next_page_url ?? this.screenLogsNextPageUrl;
        this.screenLogsPrevCursor = payload.prev_cursor ?? this.screenLogsPrevCursor;
        this.screenLogsPrevPageUrl = payload.prev_page_url ?? this.screenLogsPrevPageUrl;
        this.hasMoreLogs = !!(this.screenLogsNextCursor || this.screenLogsNextPageUrl);
        return toPrepend;
      } catch (e) {
        // soft-fail polling
        return [] as ScreenVideoPlayLog[];
      }
    },

    startLogsPolling(screenId: string | number, per_page = 100) {
      const id = String(screenId);
      this.stopLogsPolling();
      this._logsPollTimer = setInterval(() => {
        this.refreshScreenVideoPlayHead(id, { per_page });
      }, 5000);
    },
    stopLogsPolling() {
      if (this._logsPollTimer) {
        clearInterval(this._logsPollTimer);
        this._logsPollTimer = null;
      }
    },

    // Load previous (newer) page using prev_cursor/prev_page_url and prepend
    async fetchScreenVideoPlayDataPrev(screenId: string | number, params: { per_page?: number } = {}) {
      const id = String(screenId);
      if (!this.screenLogsPrevCursor && !this.screenLogsPrevPageUrl) return [] as ScreenVideoPlayLog[];
      this.loading = true;
      this.error = null;
      try {
        let cursor = this.screenLogsPrevCursor;
        if (!cursor && this.screenLogsPrevPageUrl) {
          try { const u = new URL(this.screenLogsPrevPageUrl); cursor = u.searchParams.get('cursor'); } catch {}
        }
        const response = await screenService.getScreenVideoPlayDataCursor(id, {
          cursor,
          per_page: params.per_page,
          fromDateTime: this.filterFromDateTime,
          toDateTime: this.filterToDateTime,
        });
        const payload = response.data as CursorScreenVideoPlayResponse;
        const incoming = payload.data ?? [];
        if (!incoming.length) return [] as ScreenVideoPlayLog[];
        const existing = this.screenVideoPlayData;
        const seen = new Set(existing.map((p) => `${p.ad_id}|${p.video}|${(p as any).played_at_bd}`));
        const toPrepend: ScreenVideoPlayLog[] = [];
        for (const p of incoming) {
          const key = `${p.ad_id}|${p.video}|${(p as any).played_at_bd}`;
          if (!seen.has(key)) {
            toPrepend.push(p);
            seen.add(key);
          }
        }
        if (toPrepend.length) this.screenVideoPlayData = [...toPrepend, ...existing];
        this.screenLogsPerPage = Number(payload.per_page ?? this.screenLogsPerPage);
        this.screenLogsNextCursor = payload.next_cursor ?? this.screenLogsNextCursor;
        this.screenLogsNextPageUrl = payload.next_page_url ?? this.screenLogsNextPageUrl;
        this.screenLogsPrevCursor = payload.prev_cursor ?? null;
        this.screenLogsPrevPageUrl = payload.prev_page_url ?? null;
        this.hasMoreLogs = !!(this.screenLogsNextCursor || this.screenLogsNextPageUrl);
        return toPrepend;
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load previous screen chart data";
        return [] as ScreenVideoPlayLog[];
      } finally {
        this.loading = false;
      }
    },
  },
});

