import { createSlice } from "@reduxjs/toolkit";

export const mainSlice = createSlice({
  name: "mainSlice",
  initialState: { value: 0 },
  reducers: {
    add(state) {
      state.value += 1;
    },
  },
});

export const { add } = mainSlice.actions;
export default mainSlice.reducer;
