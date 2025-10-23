import { appConfig } from "@/config/app.config";
import { LOGIN, LOGOUT } from "@/constant";
import { ApiResponse } from "@/types/common";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { authManager } from "./auth-manager";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: appConfig.apiBaseUrl,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.metadata = { startTime: Date.now() };
        const token = localStorage.getItem(appConfig.tokenKey);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {

          console.log(
            "Unauthorized access - redirecting to login",
            error.response.status
          );
          // authManager.logout(LOGIN);
        }
        return Promise.reject(error);
      }
    );
  }

  private getDynamicHeaders(data: any): Record<string, string> {
    if (data instanceof FormData) {
      return { "Content-Type": "multipart/form-data" };
    }
    if (typeof data === "object") {
      return { "Content-Type": "application/json" };
    }
    return {};
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDynamicHeaders(data),
      ...config.headers,
    };

    const response = await this.api.post<ApiResponse<T>>(url, data, {
      ...config,
      headers,
    });

    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDynamicHeaders(data),
      ...config.headers,
    };

    const response = await this.api.put<ApiResponse<T>>(url, data, {
      ...config,
      headers,
    });

    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDynamicHeaders(data),
      ...config.headers,
    };

    const response = await this.api.patch<ApiResponse<T>>(url, data, {
      ...config,
      headers,
    });

    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }
}

export const apiService = new ApiService();
