import { API_ROUTES } from "@/constants/auth.constant";
import { apiRequest } from "./api";
import { Task } from "@/interfaces/task.interface";

export const createTask = (taskData: Task) => apiRequest(API_ROUTES.TASK.CREATE_TASK, "POST", taskData);

export const getTasks = () => apiRequest(API_ROUTES.TASK.GET_TASKS, "GET");

export const updateTask = (taskId: string, taskData: Task) => apiRequest(API_ROUTES.TASK.UPDATE_TASK(taskId), "PUT", taskData);

export const deleteTask = (taskId: string) => apiRequest(API_ROUTES.TASK.DELETE_TASK(taskId), "DELETE");

