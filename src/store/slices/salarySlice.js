import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import salaryApi from '../../api/salaryApi';

export const fetchSalaryRecords = createAsyncThunk(
    'salary/fetchRecords',
    async ({ page, limit, search }, { rejectWithValue }) => {
        try {
            const data = await salaryApi.getSalaryRecords(page, limit, search);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch salary records');
        }
    }
);

export const uploadSalaryCsvAction = createAsyncThunk(
    'salary/uploadCsv',
    async (file, { rejectWithValue }) => {
        try {
            const data = await salaryApi.uploadSalaryCsv(file);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload salary file');
        }
    }
);

export const clearSalaryRecordsAction = createAsyncThunk(
    'salary/clearRecords',
    async (_, { rejectWithValue }) => {
        try {
            const data = await salaryApi.clearAllRecords();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear salary records');
        }
    }
);

const salarySlice = createSlice({
    name: 'salary',
    initialState: {
        records: [],
        pagination: {
            total: 0,
            pages: 0,
            currentPage: 1,
            limit: 20
        },
        loading: false,
        uploading: false,
        clearing: false,
        error: null,
        success: null
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Records
            .addCase(fetchSalaryRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalaryRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchSalaryRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload CSV
            .addCase(uploadSalaryCsvAction.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadSalaryCsvAction.fulfilled, (state, action) => {
                state.uploading = false;
                state.success = action.payload.message || 'Records imported successfully';
            })
            .addCase(uploadSalaryCsvAction.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            })
            // Clear Records
            .addCase(clearSalaryRecordsAction.pending, (state) => {
                state.clearing = true;
                state.error = null;
            })
            .addCase(clearSalaryRecordsAction.fulfilled, (state, action) => {
                state.clearing = false;
                state.records = [];
                state.pagination = { total: 0, pages: 0, currentPage: 1, limit: 20 };
                state.success = action.payload.message || 'All records cleared successfully';
            })
            .addCase(clearSalaryRecordsAction.rejected, (state, action) => {
                state.clearing = false;
                state.error = action.payload;
            });
    }
});

export const { clearMessages } = salarySlice.actions;
export default salarySlice.reducer;
