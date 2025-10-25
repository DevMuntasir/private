import { appConfig } from "@/config/app.config";
import { LOGIN, LOGOUT } from "@/constant";
import { buildQueryKey, getUrlPrefixes, queryClient } from "@/lib/vue-query";
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

type ExtendedAxiosRequestConfig = AxiosRequestConfig & {
  invalidateUrls?: string[];
  bypassCache?: boolean;
};

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

  private async invalidateRelatedQueries(url: string, extras: string[] = []) {
    const targets = new Set<string>();
    getUrlPrefixes(url).forEach((key) => targets.add(key));
    extras.forEach((extraUrl) => {
      getUrlPrefixes(extraUrl).forEach((key) => targets.add(key));
    });

    if (targets.size === 0) {
      return;
    }

    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => {
        if (!Array.isArray(queryKey) || queryKey.length === 0) {
          return false;
        }

        const [firstKey] = queryKey;
        if (typeof firstKey !== "string") {
          return false;
        }

        for (const target of targets) {
          if (
            firstKey === target ||
            firstKey.startsWith(`${target}/`) ||
            target.startsWith(`${firstKey}/`)
          ) {
            return true;
          }
        }

        return false;
      },
    });
  }

  async get<T>(
    url: string,
    config: ExtendedAxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { bypassCache, ...axiosConfig } = config;

    if (bypassCache) {
      const response = await this.api.get<ApiResponse<T>>(url, axiosConfig);
      return response.data;
    }

    const paramsKey = axiosConfig.params as Record<string, unknown> | undefined;
    const queryKey = buildQueryKey(url, paramsKey);

    return queryClient.fetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await this.api.get<ApiResponse<T>>(url, axiosConfig);
        return response.data;
      },
    });
  }

  async post<T>(
    url: string,
    data?: any,
    config: ExtendedAxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { invalidateUrls = [], ...axiosConfig } = config;
    const headers = {
      ...this.getDynamicHeaders(data),
      ...axiosConfig.headers,
    };

    const response = await this.api.post<ApiResponse<T>>(url, data, {
      ...axiosConfig,
      headers,
    });

    await this.invalidateRelatedQueries(url, invalidateUrls);

    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config: ExtendedAxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { invalidateUrls = [], ...axiosConfig } = config;
    const headers = {
      ...this.getDynamicHeaders(data),
      ...axiosConfig.headers,
    };

    const response = await this.api.put<ApiResponse<T>>(url, data, {
      ...axiosConfig,
      headers,
    });

    await this.invalidateRelatedQueries(url, invalidateUrls);

    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config: ExtendedAxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { invalidateUrls = [], ...axiosConfig } = config;
    const headers = {
      ...this.getDynamicHeaders(data),
      ...axiosConfig.headers,
    };

    const response = await this.api.patch<ApiResponse<T>>(url, data, {
      ...axiosConfig,
      headers,
    });

    await this.invalidateRelatedQueries(url, invalidateUrls);

    return response.data;
  }

  async delete<T>(
    url: string,
    config: ExtendedAxiosRequestConfig = {}
  ): Promise<T> {
    const { invalidateUrls = [], ...axiosConfig } = config;
    const response = await this.api.delete<ApiResponse<T>>(url, axiosConfig);

    await this.invalidateRelatedQueries(url, invalidateUrls);

    return response.data.data;
  }
}

export const apiService = new ApiService();
