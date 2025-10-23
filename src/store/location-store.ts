import { locationService } from "@/services/location-service";

import { PaginationResponse } from "@/types/pagination";
import { defineStore } from "pinia";

export const useLocationStore = defineStore("location", {
  state: () => ({
    locations: [] as any[],
    pagination: null as PaginationResponse | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllLocationWithCityCountry(params: any = {}) {
      this.loading = true;
      this.error = null;
      try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.per_page)
          queryParams.append("show", params.per_page.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.sort_by && params.sort_order) {
          queryParams.append("sort[0][field]", params.sort_by);
          queryParams.append("sort[0][direction]", params.sort_order);
        }

        const response = await locationService.getAllLocationsWithCityCountry(queryParams);

        this.locations = response.data;
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
          e instanceof Error ? e.message : "Failed to load permissions";
      } finally {
        this.loading = false;
      }
    },
  },

});
