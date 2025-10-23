import type { ApiResponse } from "@/types/common";
import { apiService } from "./api-service";

export interface BusinessProfilePayload {
  name: string;
  reg_number?: string | null;
}

export interface StepperSnapshot {
  client?: {
    id?: number | null;
    name?: string | null;
    reg_number?: string | null;
  } | null;
  stepper_count?: number;
  is_stepper_complete?: number;
}

export const clientService = {
  async submitBusinessProfile(
    payload: BusinessProfilePayload
  ): Promise<ApiResponse<BusinessProfilePayload>> {
    return apiService.post<BusinessProfilePayload>("/pns", payload);
  },

  async fetchStepperSnapshot(): Promise<ApiResponse<StepperSnapshot>> {
    return apiService.get<StepperSnapshot>("/clients/users/stepper");
  },
};
