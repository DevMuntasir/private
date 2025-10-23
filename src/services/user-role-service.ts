import { ApiResponse, RolesAndPermission } from "@/types/common";
import { apiService } from "./api-service";

export const userRolesService = {
  async getAllRole(params: any = {}): Promise<ApiResponse<RolesAndPermission>> {
    const res = await apiService.get<RolesAndPermission>(`/pns/roles/index`, {
      params,
    });

    return res;
  },
};
