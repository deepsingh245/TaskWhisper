import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TaskState, Task } from "../types";
import { fetchTasks, createTask, updateTask, deleteTask } from "../thunks/taskThunks";
import { logoutUser } from "../thunks/authThunks";

const initialState: TaskState = {
  list: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.list = action.payload;
      state.lastFetched = Date.now();
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.list.push(action.payload);
    },
    updateTaskItem: (state, action: PayloadAction<Task>) => {
      const index = state.list.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list = action.payload;
      state.lastFetched = Date.now();
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Task
    builder.addCase(createTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list.push(action.payload);
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Task
    builder.addCase(updateTask.pending, (state) => {
      // state.isLoading = true;
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.list.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Delete Task
    builder.addCase(deleteTask.pending, (state) => {
      // state.isLoading = true;
    });
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Handle Logout - Clear tasks
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.list = [];
      state.lastFetched = null;
      state.error = null;
    });
  },
});

export const { setTasks, addTask, updateTaskItem, removeTask, setError } = tasksSlice.actions;
export default tasksSlice.reducer;
