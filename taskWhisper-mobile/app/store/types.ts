export interface User {
    name?: string;
    email: string;
    password?: string;
    id?: string;
    user_metadata?: any;
    app_metadata?: any;
    aud?: string;
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
    avatar_url?: string;
    full_name?: string;
    [key: string]: any;
}

import { TaskPriority, TaskStatus } from "@/constants/api.constant";

export { TaskPriority, TaskStatus };

export interface Task {
  created_at: string;
  description: string;
  due_date: Date | null;
  id: string;
  priority: TaskPriority;
  status: TaskStatus;
  tag?:string;
  title: string;
  updated_at: string;
  user_id: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  status?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  list: Task[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}
