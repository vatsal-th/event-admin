import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import withdrawalApi from '../../api/withdrawalApi';
import toast from 'react-hot-toast';

export const fetchWithdrawals = createAsyncThunk(
    'withdrawals/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await withdrawalApi.getWithdrawals();
            // Handling both direct array and nested structure { data: { withdrawals: [...] } }
            return data.data?.withdrawals || data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawals');
        }
    }
);

export const approveWithdrawalRequest = createAsyncThunk(
    'withdrawals/approve',
    async (id, { rejectWithValue }) => {
        try {
            const data = await withdrawalApi.approveWithdrawal(id);
            toast.success(data.message || 'Withdrawal approved successfully');
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to approve withdrawal';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const rejectWithdrawalRequest = createAsyncThunk(
    'withdrawals/reject',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const data = await withdrawalApi.rejectWithdrawal(id, reason);
            toast.success(data.message || 'Withdrawal rejected successfully');
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reject withdrawal';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const fetchWithdrawalHistory = createAsyncThunk(
    'withdrawals/fetchHistory',
    async (status, { rejectWithValue }) => {
        try {
            const data = await withdrawalApi.getWithdrawalHistory(status);
            return data.data?.withdrawals || data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal history');
        }
    }
);

export const fetchWithdrawalStats = createAsyncThunk(
    'withdrawals/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await withdrawalApi.getWithdrawalStats();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdrawal stats');
        }
    }
);

const withdrawalSlice = createSlice({
    name: 'withdrawals',
    initialState: {
        items: [],
        historyItems: [],
        stats: {
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalPoints: 0
        },
        isLoading: false,
        error: null,
        isProcessing: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchWithdrawals.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWithdrawals.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchWithdrawals.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch History
            .addCase(fetchWithdrawalHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWithdrawalHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.historyItems = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchWithdrawalHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Stats
            .addCase(fetchWithdrawalStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWithdrawalStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchWithdrawalStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Approve
            .addCase(approveWithdrawalRequest.pending, (state) => {
                state.isProcessing = true;
            })
            .addCase(approveWithdrawalRequest.fulfilled, (state, action) => {
                state.isProcessing = false;
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                const historyIndex = state.historyItems.findIndex(item => item._id === action.payload._id);
                if (historyIndex !== -1) {
                    state.historyItems[historyIndex] = action.payload;
                }
            })
            .addCase(approveWithdrawalRequest.rejected, (state) => {
                state.isProcessing = false;
            })
            // Reject
            .addCase(rejectWithdrawalRequest.pending, (state) => {
                state.isProcessing = true;
            })
            .addCase(rejectWithdrawalRequest.fulfilled, (state, action) => {
                state.isProcessing = false;
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                const historyIndex = state.historyItems.findIndex(item => item._id === action.payload._id);
                if (historyIndex !== -1) {
                    state.historyItems[historyIndex] = action.payload;
                }
            })
            .addCase(rejectWithdrawalRequest.rejected, (state) => {
                state.isProcessing = false;
            });
    },
});

export default withdrawalSlice.reducer;
