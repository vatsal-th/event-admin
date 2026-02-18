import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import topupApi from '../../api/topupApi';

export const fetchAllTopups = createAsyncThunk(
    'topups/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await topupApi.getAllTopups();
            return data.data || data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch top-up requests');
        }
    }
);

export const updateTopupStatusAction = createAsyncThunk(
    'topups/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await topupApi.updateTopupStatus(id, status);
            return { id, status, data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const fetchAdminProfile = createAsyncThunk(
    'topups/fetchAdminProfile',
    async (_, { rejectWithValue }) => {
        try {
            const data = await topupApi.getAdminProfile();
            return data.data || data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin profile');
        }
    }
);

const topupSlice = createSlice({
    name: 'topups',
    initialState: {
        items: [],
        adminProfile: null,
        loading: false,
        processing: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Topups
            .addCase(fetchAllTopups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTopups.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllTopups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Status
            .addCase(updateTopupStatusAction.pending, (state) => {
                state.processing = true;
            })
            .addCase(updateTopupStatusAction.fulfilled, (state, action) => {
                state.processing = false;
                const { id, status } = action.payload;
                const index = state.items.findIndex(item => item._id === id);
                if (index !== -1) {
                    state.items[index].status = status;
                }
            })
            .addCase(updateTopupStatusAction.rejected, (state, action) => {
                state.processing = false;
                state.error = action.payload;
            })
            // Fetch Admin Profile
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.adminProfile = action.payload;
            });
    }
});

export const { clearError } = topupSlice.actions;
export default topupSlice.reducer;
