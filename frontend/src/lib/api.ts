/// <reference types="vite/client" />
import axios, { AxiosRequestConfig, Method } from "axios";
import { ApiResponse } from "@/interfaces/api.interface";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Main axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send HttpOnly cookies
});

// Request Interceptor: attach access token
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

// Concurrency handling for refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor: handle 401 and refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auth routes from refresh logic
    const isAuthRoute =
      originalRequest.url.includes("/api/auth/login") ||
      originalRequest.url.includes("/api/auth/signup") ||
      originalRequest.url.includes("/api/auth/refresh");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // If access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Create a separate axios instance for refresh
        const refreshAxios = axios.create({
          baseURL: API_URL,
          withCredentials: true,
        });

        const response = await refreshAxios.post("/api/auth/refresh");

        const { accessToken } = response.data;

        if (!accessToken) {
          throw new Error("No access token returned");
        }

        // Save new access token
        setAccessToken(accessToken);

        // Process queue
        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Refresh token failed:", refreshError);

        clearAccessToken();
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request function
export async function apiRequest<TResponse = any, TBody = any>(
  url: string,
  method: Method = "GET",
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<ApiResponse<TResponse>> {
  try {
    const response = await axiosInstance.request<TResponse>({
      url,
      method,
      data: body,
      ...config,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (err: any) {
    console.log("🚀 ~ apiRequest ~ err:", err)
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error occurred";
      

    return {
      success: false,
      message,
      status: err?.response?.status,
    };
  }
}
