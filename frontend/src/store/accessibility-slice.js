import { createSlice, configureStore } from "@reduxjs/toolkit";

const accessibilitySlice = createSlice({
  name: "accessibility",
  initialState: {
    reduceMotion: false,
  },
  reducers: {
    toggleReduceMotion(state) {
      localStorage.setItem("reduceMotion", !state.reduceMotion);
      state.reduceMotion = !state.reduceMotion;
    },
  }
});

export const accessibilityActions = accessibilitySlice.actions;

const store = configureStore({
  reducer: {
    accessibility: accessibilitySlice.reducer
  }
});
export default store;
