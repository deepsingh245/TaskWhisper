import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../types";

interface UiState {
  isEditModalOpen: boolean;
  editingTask: Task | null;
}

const initialState: UiState = {
  isEditModalOpen: false,
  editingTask: null,
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
  },
});

export const { openEditModal, closeEditModal } = uiSlice.actions;
export default uiSlice.reducer;
