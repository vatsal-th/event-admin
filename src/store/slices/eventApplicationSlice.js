import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventApplicationApi } from '../../api/eventApplicationApi';

export const fetchEventApplications = createAsyncThunk(
    'eventApplications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await eventApplicationApi.getAllApplications();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch event applications');
        }
    }
);

export const updateEventApplicationStatus = createAsyncThunk(
    'eventApplications/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await eventApplicationApi.updateApplicationStatus(id, status);
            return { id, status, message: data.message || 'Status updated successfully' };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const eventApplicationSlice = createSlice({
    name: 'eventApplications',
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
            .addCase(fetchEventApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload;
            })
            .addCase(fetchEventApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateEventApplicationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEventApplicationStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.applications.findIndex(app => app._id === action.payload.id);
                if (index !== -1) {
                    state.applications[index].status = action.payload.status;
                }
                state.success = action.payload.message;
            })
            .addCase(updateEventApplicationStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMessages } = eventApplicationSlice.actions;
export default eventApplicationSlice.reducer;
