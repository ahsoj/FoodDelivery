import { combineReducers } from "@reduxjs/toolkit";
import { homeSlice } from "./homeSlice";
import { apiSlice } from "./api/apiStore";

export const RootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  controlCart: homeSlice.reducer,
});

export type RootState = ReturnType<typeof RootReducer>;
