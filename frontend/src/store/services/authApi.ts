import { axiosInstance } from "./api";
import { User, ApiResponse } from "../types";
import { API_ROUTES } from "@/constants/api.constant";
import { LoginResponse, SignupResponse } from "../interfaces/auth.interface";

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axiosInstance.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  signup: async (userData: User) => {
    const response = await axiosInstance.post<SignupResponse>(
      API_ROUTES.AUTH.SIGNUP,
      userData
    );
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post<ApiResponse<void>>(API_ROUTES.AUTH.LOGOUT);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get<ApiResponse<User>>(API_ROUTES.AUTH.CURRENT_USER);
    return response.data;
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string }) => {
    const response = await axiosInstance.put<ApiResponse<User>>(API_ROUTES.AUTH.UPDATE_PROFILE, data);
    return response.data;
  },
};
