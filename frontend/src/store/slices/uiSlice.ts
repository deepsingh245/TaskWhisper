import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../types";

interface UiState {
  isEditModalOpen: boolean;
  editingTask: Task | null;
  language: string;
}

const initialState: UiState = {
  isEditModalOpen: false,
  editingTask: null,
  language: 'en',
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openEditModal: (state, action: PayloadAction<Task>) => {
      state.editingTask = action.payload;
      state.isEditModalOpen = true;
    },
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.editingTask = null;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const { openEditModal, closeEditModal, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
