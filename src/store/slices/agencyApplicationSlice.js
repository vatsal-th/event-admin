import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agencyApplicationApi } from '../../api/agencyApplicationApi';

export const fetchAgencyApplications = createAsyncThunk(
    'agencyApplications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await agencyApplicationApi.getAllApplications();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch agency applications');
        }
    }
);

export const updateAgencyApplicationStatus = createAsyncThunk(
    'agencyApplications/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await agencyApplicationApi.updateApplicationStatus(id, status);
            return { id, status, message: data.message || 'Status updated successfully' };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const agencyApplicationSlice = createSlice({
    name: 'agencyApplications',
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
            .addCase(fetchAgencyApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAgencyApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload;
            })
            .addCase(fetchAgencyApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateAgencyApplicationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAgencyApplicationStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.applications.findIndex(app => app._id === action.payload.id);
                if (index !== -1) {
                    state.applications[index].status = action.payload.status;
                }
                state.success = action.payload.message;
            })
            .addCase(updateAgencyApplicationStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMessages } = agencyApplicationSlice.actions;
export default agencyApplicationSlice.reducer;
