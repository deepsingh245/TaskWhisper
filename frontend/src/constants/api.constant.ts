/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const API_ROUTES = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CURRENT_USER: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
  },
  TASKS: {
    GET_ALL: "/api/tasks/getTasks",
    CREATE: "/api/tasks/createTask",
    UPDATE: (id: string) => `/api/tasks/updateTask/${id}`,
    DELETE: (id: string) => `/api/tasks/deleteTask/${id}`,
  },
  VOICE: {
    CREATE_TASK: "/api/voice/voice-task",
  }
} as const;

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  DONE = "done",
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
} as const;
