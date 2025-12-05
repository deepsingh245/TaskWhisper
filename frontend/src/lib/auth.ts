// src/services/auth.service.ts
import { API_ROUTES } from "@/constants/auth.constant";
import { apiRequest } from "./api";
import { User } from "@/interfaces/auth.interface";
import { setAccessToken, clearAccessToken } from "./token";

export const signup = (userData: User) =>
  apiRequest(API_ROUTES.AUTH.SIGNUP, "POST", userData);

export const login = async ({ email, password }: { email: string; password: string }) => {
  const response = await apiRequest(API_ROUTES.AUTH.LOGIN, "POST", { email, password });
  if (response.success && response.data?.accessToken) {
    setAccessToken(response.data.accessToken);
  }
  return response;
};

export const logout = async () => {
  const response = await apiRequest(API_ROUTES.AUTH.LOGOUT, "POST");
  clearAccessToken();
  return response;
};

export const getCurrentUser = () => apiRequest(API_ROUTES.AUTH.CURRENT_USER, "GET");
