import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { User } from "../types";
import { setAccessToken, clearAccessToken } from "../services/tokenService";
import { SignupResponse } from "../interfaces/auth.interface";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      if (!response.accessToken) {
        return rejectWithValue(response.message || "Login failed");
      }

      setAccessToken(response.accessToken);

      return response;
    } catch (error: any) {
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed";

      return rejectWithValue(backendError);
    }
  }
);

export const registerUser = createAsyncThunk<SignupResponse, { name: string; email: string; password: string }, { rejectValue: string }>(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(userData);

      // Signup API has no `success` or `accessToken` field
      if (!response.user) {
        return rejectWithValue(response.message || "Signup failed");
      }

      return response; // contains { message, user }

    } catch (error: any) {
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Signup failed";

      return rejectWithValue(backendError);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      clearAccessToken();
    }
    return null;
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      const data = response as any;
      if (data.success) {
          return data.data;
      } else {
          return rejectWithValue(data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
