import { axiosInstance } from "./api";
import { Task, ApiResponse } from "../types";
import { API_ROUTES } from "@/constants/api.constant";

export const tasksApi = {
  fetchTasks: async () => {
    const response = await axiosInstance.get<ApiResponse<Task[]>>(API_ROUTES.TASKS.GET_ALL);
    return response;
  },

  createTask: async (taskData: Partial<Task>) => {
    const response = await axiosInstance.post<ApiResponse<Task>>(API_ROUTES.TASKS.CREATE, taskData);
    return response;
  },

  updateTask: async (id: string, taskData: Partial<Task>) => {
    const response = await axiosInstance.put<ApiResponse<Task>>(API_ROUTES.TASKS.UPDATE(id), taskData);
    return response;
  },

  deleteTask: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(API_ROUTES.TASKS.DELETE(id));
    return response;
  },
};
