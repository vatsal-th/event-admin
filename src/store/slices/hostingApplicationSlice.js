import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hostingApplicationApi } from '../../api/hostingApplicationApi';

export const fetchHostingApplications = createAsyncThunk(
    'hostingApplications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await hostingApplicationApi.getAllApplications();
            return data.data; // Assuming response format { success: true, data: [...] }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch hosting applications');
        }
    }
);

export const updateHostingApplicationStatus = createAsyncThunk(
    'hostingApplications/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await hostingApplicationApi.updateApplicationStatus(id, status);
            return { id, status, message: data.message || 'Status updated successfully' };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const hostingApplicationSlice = createSlice({
    name: 'hostingApplications',
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
            // Fetch Applications
            .addCase(fetchHostingApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHostingApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload;
            })
            .addCase(fetchHostingApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Status
            .addCase(updateHostingApplicationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateHostingApplicationStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.applications.findIndex(app => app._id === action.payload.id);
                if (index !== -1) {
                    state.applications[index].status = action.payload.status;
                }
                state.success = action.payload.message;
            })
            .addCase(updateHostingApplicationStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMessages } = hostingApplicationSlice.actions;
export default hostingApplicationSlice.reducer;
