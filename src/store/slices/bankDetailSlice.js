import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bankDetailApi from '../../api/bankDetailApi';
import toast from 'react-hot-toast';

export const fetchBankDetails = createAsyncThunk(
    'bankDetails/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await bankDetailApi.getBankDetails();
            // Based on user response: { success: true, data: { bankDetails: [...], pagination: {...} } }
            return data.data.bankDetails;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bank details');
        }
    }
);

export const verifyBankStatus = createAsyncThunk(
    'bankDetails/verify',
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            const data = await bankDetailApi.verifyBankDetail(id, status, reason);
            toast.success(data.message || `Bank account ${status} successfully`);
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || `Failed to ${status} bank account`;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const bankDetailSlice = createSlice({
    name: 'bankDetails',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
        isProcessing: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchBankDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBankDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchBankDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Verify
            .addCase(verifyBankStatus.pending, (state) => {
                state.isProcessing = true;
            })
            .addCase(verifyBankStatus.fulfilled, (state, action) => {
                state.isProcessing = false;
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(verifyBankStatus.rejected, (state) => {
                state.isProcessing = false;
            });
    },
});

export default bankDetailSlice.reducer;
