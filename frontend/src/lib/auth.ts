import { API_ROUTES } from "@/constants/auth.constant";
import { apiRequest } from "@/lib/api";
import { User } from "@/interfaces/auth.interface";
import { setAccessToken, clearAccessToken } from "@/lib/token";

// Signup
export const signup = (userData: User) =>
  apiRequest(API_ROUTES.AUTH.SIGNUP, "POST", userData);

// Login
export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await apiRequest(API_ROUTES.AUTH.LOGIN, "POST", {
    email,
    password,
  });

  // Save access token if login is successful
  if (response.success && response.data?.accessToken) {
    setAccessToken(response.data.accessToken);
  }

  return response;
};

// Logout
export const logout = async () => {
  const response = await apiRequest(API_ROUTES.AUTH.LOGOUT, "POST");
  clearAccessToken();
  return response;
};

// Get current user (requires auth)
export const getCurrentUser = () =>
  apiRequest(API_ROUTES.AUTH.CURRENT_USER, "GET");
