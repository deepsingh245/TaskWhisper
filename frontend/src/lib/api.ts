
/// <reference types="vite/client" />
import axios, { AxiosRequestConfig, Method } from "axios";
import { ApiResponse } from "@/interfaces/api.interface";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HttpOnly cookies
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const response = await axiosInstance.post("/api/auth/refresh");
        
        const { accessToken } = response.data;
        setAccessToken(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("🚀 ~ refreshError:", refreshError)
        // Refresh failed - clear token and redirect to login
        debugger;
        // clearAccessToken();
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function apiRequest<TResponse = any, TBody = any>(
  url: string,
  method: Method = "GET",
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<ApiResponse<TResponse>> {
  try {
    // If url is absolute (starts with http), use it directly, otherwise let axiosInstance handle baseURL
    // However, our existing code passes full URLs from API_ROUTES. 
    // We should probably strip the baseURL if it matches, or just use the instance.
    // Given the existing API_ROUTES have VITE_BACKEND_URL, we might need to handle this.
    // Actually, axios instance baseURL is prepended ONLY if url is relative.
    // If we pass a full URL, axios uses it.
    
    const response = await axiosInstance.request<TResponse>({
      url,
      method,
      data: body,
      ...config,
    });
    console.log("🚀 ~ apiRequest ~ response:", response)

    return {
      success: true,
      data: response.data,
    };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Unknown error occurred";
    console.log("🚀 ~ apiRequest ~ message:", message)

    return {
      success: false,
      message,
      status: err?.response?.status,
    };
  }
}
