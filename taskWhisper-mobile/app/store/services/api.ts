import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenService";
import { API_BASE_URL, API_ROUTES } from "@/constants/api.constant";
import { Store } from "@reduxjs/toolkit";
import { router } from "expo-router";

let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const refreshErrorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.response?.data?.detail;

    if (
      refreshErrorMessage?.includes("Invalid Refresh Token")
    ) {
      await clearAccessToken();
      if (store) store.dispatch({ type: "auth/logout" });
      router.replace("/auth/login");
      return Promise.reject(error);
    }

    if (
      originalRequest.url.includes(API_ROUTES.AUTH.LOGIN) ||
      originalRequest.url.includes(API_ROUTES.AUTH.SIGNUP)
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}${API_ROUTES.AUTH.REFRESH}`,
          {},
          {
            withCredentials: true
          }
        );

        const { accessToken } = response.data;

        if (!accessToken) throw new Error("No accessToken returned");

        await setAccessToken(accessToken);

        if (store)
          store.dispatch({
            type: "auth/setCredentials",
            payload: { accessToken },
          });

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        await clearAccessToken();
        if (store) store.dispatch({ type: "auth/logout" });
        router.replace("/auth/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
