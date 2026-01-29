import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { influencerApplicationApi } from '../../api/influencerApplicationApi';

export const fetchInfluencerApplications = createAsyncThunk(
    'influencerApplications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await influencerApplicationApi.getAllApplications();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch influencer applications');
        }
    }
);

export const updateInfluencerApplicationStatus = createAsyncThunk(
    'influencerApplications/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await influencerApplicationApi.updateApplicationStatus(id, status);
            return { id, status, message: data.message || 'Status updated successfully' };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const influencerApplicationSlice = createSlice({
    name: 'influencerApplications',
    initialState: {
        applications: [],
        loading: false,
        error: null,
        success: null,
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.success = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInfluencerApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInfluencerApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload;
            })
            .addCase(fetchInfluencerApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateInfluencerApplicationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateInfluencerApplicationStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.applications.findIndex(app => app._id === action.payload.id);
                if (index !== -1) {
                    state.applications[index].status = action.payload.status;
                }
                state.success = action.payload.message;
            })
            .addCase(updateInfluencerApplicationStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMessages } = influencerApplicationSlice.actions;
export default influencerApplicationSlice.reducer;
