import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import complaintApi from '../../api/complaintApi';

const initialState = {
    complaints: [],
    loading: false,
    error: null,
};

export const fetchComplaints = createAsyncThunk(
    'complaints/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await complaintApi.getAllComplaints();
            return data.complaints || data; // Handle different response structures
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
        }
    }
);

export const resolveComplaintAction = createAsyncThunk(
    'complaints/resolve',
    async ({ id, resolutionNote }, { rejectWithValue }) => {
        try {
            const data = await complaintApi.resolveComplaint(id, resolutionNote);
            return { id, data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resolve complaint');
        }
    }
);

const complaintSlice = createSlice({
    name: 'complaints',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComplaints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComplaints.fulfilled, (state, action) => {
                state.loading = false;
                state.complaints = action.payload;
            })
            .addCase(fetchComplaints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resolveComplaintAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(resolveComplaintAction.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.complaints.findIndex((c) => c._id === action.payload.id);
                if (index !== -1) {
                    state.complaints[index] = { ...state.complaints[index], ...action.payload.data.complaint, status: 'resolved' };
                }
            })
            .addCase(resolveComplaintAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = complaintSlice.actions;
export default complaintSlice.reducer;
