import { ApiResponse } from "@/types/common";
import {
  City,
  CityByCountry,
  CityResponse,
  CityLocation,
  Country,
  Locations,
  LocationsResponse,
  LocationStatistics,
  State,
} from "@/types/location-types";
import { apiService } from "./api-service";

export const locationService = {
  async getAllCity(): Promise<ApiResponse<City[]>> {
    const res = await apiService.get<City[]>(`/pns/cities/all`);
    return res;
  },
  async getCitiesByCountryId(id:number): Promise<ApiResponse<CityByCountry>> {
    const res = await apiService.get<CityByCountry>(`/pns/countries/${id}`);
    return res;
  },
  
  async getAllCountry(): Promise<ApiResponse<Country[]>> {
    const res = await apiService.get<Country[]>(`/pns/countries/all`);
    return res;
  },
  async getAllLocation(): Promise<ApiResponse<LocationsResponse[]>> {
    const res = await apiService.get<LocationsResponse[]>(`/pns/locations/all`);
    return res;
  },
  async getAllStates(): Promise<ApiResponse<State[]>> {
    const res = await apiService.get<State[]>(`/pns/states/all`);
    return res;
  },
  async getLocationStatistics(): Promise<ApiResponse<LocationStatistics>> {
    const res = await apiService.get<LocationStatistics>(`/pns/pn-users/location-info`);
    return res;
  },
  async getSubAreaByCity(
    citys: number[]
  ): Promise<ApiResponse<CityLocation[]>> {
    const res = await apiService.get<CityLocation[]>(
      `/pns/cities/wise/locations`,
      {
        params: {
          "city_ids[]": citys,
        },
      }
    );
    return res;
  },
  async createCountry(payload): Promise<ApiResponse<Country>> {
    const res = await apiService.post<Country>(`/pns/countries`,payload);
    return res;
  },
  async createState(payload: State): Promise<ApiResponse<State>> {
    const res = await apiService.post<State>(`/pns/states`,payload);
    return res;
  },
  async createCity(payload): Promise<ApiResponse<CityResponse>> {
    const res = await apiService.post<CityResponse>(`/pns/cities`,payload);
    return res;
  },
  async createLocation(payload:Locations): Promise<ApiResponse<Locations>> {
    const res = await apiService.post<Locations>(`/pns/locations`,payload);
    return res;
  },
    async getAllLocationsWithCityCountry(params:any ={}): Promise<ApiResponse<any>> {
    const res = await apiService.get<any>(`/pns/locations/list/index`,{
      params
    });
    return res
  }
};
