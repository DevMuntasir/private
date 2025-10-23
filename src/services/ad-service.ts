import type {
  Ad,
  AdDetailResponse,
  AdResponse,
  QrResponse,
} from "@/types/ad-types";
import type { ApiResponse } from "@/types/common";
import { apiService } from "./api-service";

export const adService = {
  async create(payload: any): Promise<ApiResponse<Ad>> {
    return await apiService.post<Ad>("/pns/ads/store", payload);
  },

  async getAllAds(params: any = {}): Promise<ApiResponse<AdResponse>> {
    return await apiService.get<AdResponse>("/pns/ads/index", {
      params,
    });
  },

  async getAd(id: number): Promise<ApiResponse<AdDetailResponse>> {
    return await apiService.get<AdDetailResponse>(`/pns/ads/${id}`);
  },

  async adsVideoUpload(payload: FormData): Promise<ApiResponse<any>> {
    return await apiService.post<Ad>(`/pns/ads/generate-url/upload`, payload);
  },
  async adsVideoUploadOnS3(payload: any): Promise<ApiResponse<any>> {
    return await apiService.post<Ad>(
      "/clients/ads/generate-url/upload",
      payload
    );
  },
  async update(id: number, payload: any): Promise<ApiResponse<AdResponse>> {
    return await apiService.put<AdResponse>(`/pns/ads/${id}`, payload);
  },
  async updateAdminAdStatus(
    id: number,
    payload: any
  ): Promise<ApiResponse<AdResponse>> {
    const res = await apiService.patch<AdResponse>(`/pns/ads/${id}`, payload);
    return res;
  },
  async generateQRCode(payload: {
    url: string;
  }): Promise<ApiResponse<QrResponse>> {
    const res = await apiService.post<QrResponse>(
      `/pns/ads/generate-qr`,
      payload
    );
    return res;
  },

  async updateAdsPlaylist(payload: any): Promise<ApiResponse<any>> {
    return await apiService.put<any>(`/pns/ads/playlist/update`, payload);
  },
};
