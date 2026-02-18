import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import walletApi from '../../api/walletApi';

export const fetchWalletSummary = createAsyncThunk(
    'wallet/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const data = await walletApi.getWalletSummary();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet summary');
        }
    }
);

export const fetchWalletTransactions = createAsyncThunk(
    'wallet/fetchTransactions',
    async (type, { rejectWithValue }) => {
        try {
            const data = await walletApi.getWalletTransactions(type);
            return data.data?.transactions || data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        summary: {
            currentBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            breakdown: {
                topUpsReceived: 0
            }
        },
        transactions: [],
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWalletSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWalletSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.summary = action.payload;
            })
            .addCase(fetchWalletSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchWalletTransactions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.transactions = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchWalletTransactions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default walletSlice.reducer;
