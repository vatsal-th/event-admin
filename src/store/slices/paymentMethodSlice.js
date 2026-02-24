import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paymentMethodApi from "../../api/paymentMethodApi";

export const fetchAllPaymentMethods = createAsyncThunk(
  "paymentMethods/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await paymentMethodApi.getAllPaymentMethods();
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment methods",
      );
    }
  },
);

export const addPaymentMethodAction = createAsyncThunk(
  "paymentMethods/add",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await paymentMethodApi.addPaymentMethod(formData);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add payment method",
      );
    }
  },
);

export const updatePaymentMethodAction = createAsyncThunk(
  "paymentMethods/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await paymentMethodApi.updatePaymentMethod(id, formData);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update payment method",
      );
    }
  },
);

export const deletePaymentMethodAction = createAsyncThunk(
  "paymentMethods/delete",
  async (id, { rejectWithValue }) => {
    try {
      await paymentMethodApi.deletePaymentMethod(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete payment method",
      );
    }
  },
);

const paymentMethodSlice = createSlice({
  name: "paymentMethods",
  initialState: {
    methods: [],
    loading: false,
    processing: false,
    error: null,
  },
  reducers: {
    clearPaymentMethodError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.methods = action.payload;
      })
      .addCase(fetchAllPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addPaymentMethodAction.pending, (state) => {
        state.processing = true;
      })
      .addCase(addPaymentMethodAction.fulfilled, (state, action) => {
        state.processing = false;
        state.methods.push(action.payload);
      })
      .addCase(addPaymentMethodAction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updatePaymentMethodAction.pending, (state) => {
        state.processing = true;
      })
      .addCase(updatePaymentMethodAction.fulfilled, (state, action) => {
        state.processing = false;
        const index = state.methods.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (index !== -1) {
          state.methods[index] = action.payload;
        }
      })
      .addCase(updatePaymentMethodAction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deletePaymentMethodAction.pending, (state) => {
        state.processing = true;
      })
      .addCase(deletePaymentMethodAction.fulfilled, (state, action) => {
        state.processing = false;
        state.methods = state.methods.filter((m) => m._id !== action.payload);
      })
      .addCase(deletePaymentMethodAction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentMethodError } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;
