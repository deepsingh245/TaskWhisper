import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/slices/auth.slice";
import exampleReducer from "@/slices/example.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  example: exampleReducer,
});

export default rootReducer;
