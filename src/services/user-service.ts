
import { ApiResponse } from "@/types/common";
import { apiService } from "./api-service";
import { User, UserCreateRequest, UserUpdateRequest } from "@/types/user-types";



export const userService = {

  async getAllUsers(params:any ={}): Promise<ApiResponse<User>> {
    const res = await apiService.get<User>(`/pns/users/index`,{
      params
    });
    return res
  },
    async getAuthUser(): Promise<ApiResponse<User>> {
    const res = await apiService.get<User>(`/pns/users/me`);
    return res
  },
    async getAdminUserClient(): Promise<ApiResponse<{
      id:number,
      name:string
    }>> {
    const res = await apiService.get<{
      id:number,
      name:string
    }>(`/pns/users/me`);
    return res
  },
  

  async create(data: UserCreateRequest): Promise<ApiResponse<User>> {
    return await apiService.post<User>("/pns/users/store", data);
  },

  async update(id: number, data: UserUpdateRequest): Promise<ApiResponse<UserUpdateRequest>> {
   let res = await apiService.put<UserUpdateRequest>(`/pns/users/${id}`, data)
    return res
  },

  async delete(id: number): Promise<void> {
    return apiService.delete(`/pns/users/${id}`);
  },
};
