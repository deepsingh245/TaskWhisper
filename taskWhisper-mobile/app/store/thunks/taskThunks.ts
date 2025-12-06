import { createAsyncThunk } from "@reduxjs/toolkit";
import { tasksApi } from "../services/tasksApi";
import { Task } from "../types";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksApi.fetchTasks();
      if (response.status === 200) {
        // @ts-ignore - Assuming successful response structure
        return response.data.data ? response.data.data : response.data;
      } else {
        return rejectWithValue(response.statusText);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch tasks");
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      const tasksState = state.tasks;
      const now = Date.now();
      const STALE_TIME = 5 * 60 * 1000; // 5 minutes
      if (tasksState.lastFetched && (now - tasksState.lastFetched < STALE_TIME)) {
        return false;
      }
      return true;
    },
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const response = await tasksApi.createTask(taskData);
      console.log("🚀 ~ response:", response)
      if (response.status === 201) {
        // @ts-ignore
        return response.data.data ? response.data.data : response.data;
      } else {
        return rejectWithValue(response.statusText);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.updateTask(id, data);
      console.log("🚀 ~ response:", response)
      if (response.status === 200) {
        // @ts-ignore
        return response.data.data ? response.data.data : response.data;
      } else {
        return rejectWithValue(response.statusText);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update task");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await tasksApi.deleteTask(id);
      console.log("🚀 ~ response:", response)
      if (response.status === 200) {
        return id;
      } else {
        return rejectWithValue(response.statusText);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete task");
    }
  }
);

export const createVoiceTask = createAsyncThunk(
  "tasks/createVoice",
  async (taskData: Partial<Task>, { dispatch }) => {
    return dispatch(createTask(taskData)).unwrap();
  }
);
