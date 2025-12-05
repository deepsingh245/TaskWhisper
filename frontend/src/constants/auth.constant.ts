/// <reference types="vite/client" />

export const API_ROUTES = {
  AUTH: {
    SIGNUP: `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
    LOGIN: `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
    LOGOUT: `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
    CURRENT_USER: `${import.meta.env.VITE_BACKEND_URL}/api/auth/current-user`,
  },
  TASK: {
    CREATE_TASK: `${import.meta.env.VITE_BACKEND_URL}/api/tasks/createTask`,
    GET_TASKS: `${import.meta.env.VITE_BACKEND_URL}/api/tasks/getTasks`,
    UPDATE_TASK: (taskId: string) => `${import.meta.env.VITE_BACKEND_URL}/api/tasks/updateTask/${taskId}`,
    DELETE_TASK: (taskId: string) => `${import.meta.env.VITE_BACKEND_URL}/api/tasks/deleteTask/${taskId}`,
    VOICE_TASK: `${import.meta.env.VITE_BACKEND_URL}/api/voice/voice-task`,
  },
  REFRESH: `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
  LOGOUT: `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
} as const;
