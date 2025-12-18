export const API_BASE_URL = "https://6ba0274fbb73.ngrok-free.app";

export const API_ROUTES = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CURRENT_USER: "/api/auth/current-user",
    REFRESH: "/api/auth/refresh",
    UPDATE_PROFILE: "/api/auth/update-profile",
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
