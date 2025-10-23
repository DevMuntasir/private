import { defineStore } from "pinia";
import type {  Ad, AdResponse, Audience } from "@/types/ad-types";
import type { PaginationResponse } from "@/types/pagination";
import { adService } from "@/services/ad-service";

export const useAdsStore = defineStore("ads", {
  state: () => ({
    loading: false,
    success: false,
    error: null as string | null,
    ads: [] as Ad[],
    pagination: null as PaginationResponse | null,
    message: ''
  }),

  actions: {
    resetState() {
      this.loading = false;
      this.success = false;
      this.error = null;
    },
    async fetchAllAdsIndex(params: any = {}) {
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

        const response = await adService.getAllAds(queryParams);

        this.ads = response.data;
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
        this.error = e?.message || "Failed to load ads";
      } finally {
        this.loading = false;
      }
    },
    async createAd(formValues: {
      adName: string;
      campaign_id: string;
      videoFile: File | null;
      audiences: Audience[];
    }) {
      this.loading = true;
      this.error = null;
      this.success = false;

      const formData = new FormData();
      formData.append("name", formValues.adName);
      formData.append("campaign_id", formValues.campaign_id);

      if (formValues.videoFile) {
        formData.append("video_url", formValues.videoFile);
      }

      formValues.audiences.forEach((audience, i) => {
        formData.append(`audiences[${i}][gender]`, audience.gender);
        formData.append(`audiences[${i}][age_group]`, String(Number(audience.age_group)));
      });

      try {
        const response = await adService.create(formData);
        this.success = true;
        return response;
      } catch (err: any) {
        this.error = err?.response?.data?.message || "Failed to create ad.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateAdStatus(
          id: number,
          payload: any,
        ) {
          this.loading = true;
          this.error = null;
          this.success = false;
    
          try {
            console.log('call');
            
            const res = await adService.updateAdminAdStatus(id, payload);
            this.success = true;
            this.message = res.message;
            return res;
          } catch (err: any) {
            // eslint-disable-next-line
            this.error = err.response?.data?.message || "Failed to update campaign";
            return err;
          } finally {
            this.loading = false;
          }
    },
  },
   
});
