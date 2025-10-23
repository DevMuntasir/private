export type City = {
  id?: number;
  name: string;
  typeable_type?: string;
  typeable_id?: number;
};

export type CityByCountry ={
  id: number;
  name: string;
  cities: City[];
  created_at: string; // formatted date e.g. "06 Aug 2025"
  updated_at: string; // formatted date e.g. "06 Aug 2025"
}

export type Country = {
  id?: number;
  name: string;
};
export type State = {
  id?: number;
  name: string;
  country_id: number;
};
export type CityPayload = {
  name: number;
  typeable_type: string;
  typeable_id: number;
};
export type Locations = {
  id?: number;
  name: string;
  city_id: number;
};

export type CityResponse = {
  id: number;
  name: string;
  typeable_type: string; // e.g., "App\\Models\\Country"
  country: Country;
  created_at: string; // e.g., "24 Aug 2025"
  updated_at: string; // e.g., "24 Aug 2025"
};

export interface LocationsResponse {
  id: number;
  name: string;
  city: City;
  created_at: string;
  updated_at: string;
}

export interface LocationStatistics {
  country: number;
  location: number;
  city: number;
  state: number;
}

export interface CityLocation {
  id: number;
  name: string;
  locations: LocationSummary[];
}

export interface LocationSummary {
  id: number;
  name: string;
  pn_id?: number;
  city_id?: number;
  created_at?: string;
  updated_at?: string;
}
