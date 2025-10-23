import { apiService } from "./api-service"
import { Login, LoginResponse, Registration } from "@/types/auth-types"
import { authManager } from "./auth-manager"
import { ApiResponse } from "@/types/common"
import { LOGIN, LOGOUT } from "@/constant"

export const authService = {
  async login(credentials: Login): Promise<ApiResponse<LoginResponse>> {
    return apiService.post<LoginResponse>(
      "/pns/users/login",
      credentials
    )
  },

  async logout(): Promise<void> {
    try {
      await apiService.post(LOGOUT)
    } catch (e) {
      console.warn("Logout failed", e)
    } finally {
      authManager.logout(LOGIN)
    }
  },

  async register(userData: Registration): Promise< ApiResponse<Registration>> {
    return apiService.post<Registration>(
      "/pns/users/register",
      userData
    )
  },

  async forgotPassword(email: string) {
    return apiService.post("/pns/users/forgot-password", { email })
  },
    async resendOtp(email: string): Promise<ApiResponse<void>> {
    return apiService.post("/pns/users/resend-verification-code", { email })
  },
      async verifyOtp(otp:number,email:string): Promise<ApiResponse<void>> {
    return apiService.post("/pns/users/verify-code", { email,verification_code: otp })
  },

  async resetPassword(data: {
    email: string
    password: string
    password_confirmation: string
    token: string
  }) {
    return apiService.post("/pns/users/reset-forgot-password", data)
  },
  async authResetPassword(id:number,data: {
 
    password: string
    password_confirmation: string
  }) {
    return apiService.put(`/pns/users/${id}/reset-password`, data)
  },
  
}
