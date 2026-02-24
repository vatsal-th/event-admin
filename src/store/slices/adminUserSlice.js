import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminUserApi from "../../api/adminUserApi";

export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminUserApi.getAllUsers();
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const toggleFreezeWalletAction = createAsyncThunk(
  "adminUsers/toggleFreeze",
  async ({ userId, isWalletFrozen }, { rejectWithValue }) => {
    try {
      const data = await adminUserApi.toggleFreezeWallet(
        userId,
        isWalletFrozen,
      );
      return { userId, isWalletFrozen, data: data.data || data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update freeze status",
      );
    }
  },
);

export const adjustBalanceAction = createAsyncThunk(
  "adminUsers/adjustBalance",
  async ({ userId, amount, action, reason }, { rejectWithValue }) => {
    try {
      const data = await adminUserApi.adjustBalance(userId, {
        amount,
        action,
        reason,
      });
      return { userId, data: data.data || data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to adjust balance",
      );
    }
  },
);

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    loading: false,
    processing: false,
    error: null,
  },
  reducers: {
    clearAdminUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Freeze
      .addCase(toggleFreezeWalletAction.pending, (state) => {
        state.processing = true;
      })
      .addCase(toggleFreezeWalletAction.fulfilled, (state, action) => {
        state.processing = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.userId,
        );
        if (index !== -1) {
          state.users[index].isWalletFrozen = action.payload.isWalletFrozen;
        }
      })
      .addCase(toggleFreezeWalletAction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })
      // Adjust Balance
      .addCase(adjustBalanceAction.pending, (state) => {
        state.processing = true;
      })
      .addCase(adjustBalanceAction.fulfilled, (state, action) => {
        state.processing = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.userId,
        );
        if (index !== -1) {
          // Update points from the response if available, or just refetch users
          state.users[index] = {
            ...state.users[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(adjustBalanceAction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminUserError } = adminUserSlice.actions;
export default adminUserSlice.reducer;
