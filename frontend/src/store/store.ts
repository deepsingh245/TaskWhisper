import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tasksReducer from "./slices/tasksSlice";
import uiReducer from "./slices/uiSlice";
import { injectStore } from "./services/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Inject store into API service to handle circular dependency for dispatching actions from interceptors
injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
