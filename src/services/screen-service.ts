import type { Ad, AdResponse } from "@/types/ad-types";
import type { ApiResponse } from "@/types/common";
import { apiService } from "./api-service";
import {
  ScreenPayload,
  Screens,
  PaginatedScreenVideoPlayResponse,
  CursorScreenVideoPlayResponse,
  CursorScreenStatusResponse,
  ScreenPlaylistConfirmation,


} from "@/types/screen-type";

export const screenService = {
  async create(payload: any): Promise<ApiResponse<ScreenPayload>> {
    return await apiService.post<ScreenPayload>(
      "/pns/screens/store",
      payload
    );
  },

  async getAllScreen(params: any = {}): Promise<ApiResponse<Screens>> {
    return await apiService.get<Screens>("/pns/screens/index", { params });
  },
  // async getAllScreenByLocationIds(params: any = {}): Promise<ApiResponse<Screens>> {
  //   return await apiService.get<Screens>("/pns/screens/all", { params });
  // },
  async getScreensByLocation(
    locationIds: number[]
  ): Promise<ApiResponse<Screens[]>> {
    return await apiService.get<Screens[]>("/pns/screens/all", {
      params: { "location_ids[]": locationIds },
    });
  },

  async getScreenDetails(id: number): Promise<ApiResponse<Screens>> {
    return await apiService.get<Screens>(`/pns/screens/${id}`);
  },

  async update(id: number, payload: any): Promise<ApiResponse<Screens>> {
    return await apiService.put<Screens>(`/pns/screens/${id}`, payload);
  },

  async getScreenVideoPlayData(
    screenId: number,
    params: {
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<ApiResponse<PaginatedScreenVideoPlayResponse>> {
    return await apiService.get<PaginatedScreenVideoPlayResponse>(
      "/screenVideoPlayData",
      { params: { screenId, ...params, show: 20 } }
    );
  },

  async getScreenVideoPlayDataCursor(
    screenId: string | number,
    params: {
      cursor?: string | null;
      per_page?: number;
      fromDateTime?: string | null;
      toDateTime?: string | null;
    } = {}
  ): Promise<ApiResponse<CursorScreenVideoPlayResponse>> {
    const {
      cursor = undefined,
      per_page,
      fromDateTime,
      toDateTime,
    } = params ?? {};
    const normalizedId = String(screenId);
    return await apiService.get<CursorScreenVideoPlayResponse>(
      "/screenVideoPlayData",
      {
        params: {
          screenId: normalizedId,
          cursor,
          show: 20,
          fromDateTime: fromDateTime ?? undefined,
          toDateTime: toDateTime ?? undefined,
        },
      }
    );
  },

  async getScreenVideoPlayDataCursorByUrl(
    url: string
  ): Promise<ApiResponse<CursorScreenVideoPlayResponse>> {
    return await apiService.get<CursorScreenVideoPlayResponse>(url);
  },

  /**
   * Cursor-based screen status timeline (CPU/RAM/Disk etc.) for realtime charts & polling.
   * Use the returned next_page_url for fetching subsequent pages.
   */
  async getScreenStatusDataCursor(
    params: {
      cursor?: string | null;
      per_page?: number;
      fromDateTime?: string | null;
      toDateTime?: string | null;
      screenId?: number;
    } = {}
  ): Promise<ApiResponse<CursorScreenStatusResponse>> {
    const { cursor, per_page, fromDateTime, toDateTime, screenId } =
      params ?? {};
    return await apiService.get<CursorScreenStatusResponse>(
      "/screenStatusData",
      {
        params: {
          cursor: cursor ?? undefined,
          show: 50,
          fromDateTime: fromDateTime ?? undefined,
          toDateTime: toDateTime ?? undefined,
          screenId: screenId ?? undefined,
        },
      }
    );
  },

  async getScreenStatusDataCursorByUrl(
    url: string
  ): Promise<ApiResponse<CursorScreenStatusResponse>> {
    return await apiService.get<CursorScreenStatusResponse>(url);
  },

  async confirmScreens(payload: {
    screen_id: number[]
  }): Promise<
    ApiResponse<ScreenPlaylistConfirmation[]>
  > {
    return await apiService.post<
     ScreenPlaylistConfirmation[]
    >("/pns/screens/confirmation", payload);
  },
};
