import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import rechargeApi from "../../api/rechargeApi";

export const fetchAllRecharges = createAsyncThunk(
  "recharges/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await rechargeApi.getAllRecharges();
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recharge requests",
      );
    }
  },
);

export const updateRechargeStatusAction = createAsyncThunk(
  "recharges/updateStatus",
  async ({ id, status, adminNote }, { rejectWithValue }) => {
    try {
      const data = await rechargeApi.updateRechargeStatus(id, {
        status,
        adminNote,
      });
      return { id, status, adminNote, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update recharge status",
      );
    }
  },
);

const rechargeSlice = createSlice({
  name: "recharges",
  initialState: {
    items: [],
    loading: false,
    processing: false,
    error: null,
  },
  reducers: {
    clearRechargeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllRecharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecharges.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllRecharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateRechargeStatusAction.pending, (state) => {
        state.processing = true;
      })
      .addCase(updateRechargeStatusAction.fulfilled, (state, action) => {
        state.processing = false;
        const { id, status } = action.payload;
        const index = state.items.findIndex((item) => item._id === id);
        if (index !== -1) {
          state.items[index].status = status;
        }
      })
      .addCase(updateRechargeStatusAction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      });
  },
});

export const { clearRechargeError } = rechargeSlice.actions;
export default rechargeSlice.reducer;
