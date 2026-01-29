import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appApi from '../../api/appApi';

// Async thunks
export const fetchApps = createAsyncThunk(
    'apps/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await appApi.getAllApps();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch apps');
        }
    }
);

export const addApp = createAsyncThunk(
    'apps/add',
    async (appData, { rejectWithValue }) => {
        try {
            const response = await appApi.addApp(appData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add app');
        }
    }
);

export const updateApp = createAsyncThunk(
    'apps/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await appApi.updateApp(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update app');
        }
    }
);

export const deleteApp = createAsyncThunk(
    'apps/delete',
    async (id, { rejectWithValue }) => {
        try {
            await appApi.deleteApp(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete app');
        }
    }
);

const appSlice = createSlice({
    name: 'apps',
    initialState: {
        apps: [],
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
            // Fetch apps
            .addCase(fetchApps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApps.fulfilled, (state, action) => {
                state.loading = false;
                state.apps = action.payload;
            })
            .addCase(fetchApps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add app
            .addCase(addApp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addApp.fulfilled, (state, action) => {
                state.loading = false;
                state.apps.push(action.payload);
                state.success = 'App added successfully';
            })
            .addCase(addApp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update app
            .addCase(updateApp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateApp.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.apps.findIndex(a => a._id === action.payload._id);
                if (index !== -1) {
                    state.apps[index] = action.payload;
                }
                state.success = 'App updated successfully';
            })
            .addCase(updateApp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete app
            .addCase(deleteApp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteApp.fulfilled, (state, action) => {
                state.loading = false;
                state.apps = state.apps.filter(a => a._id !== action.payload);
                state.success = 'App deleted successfully';
            })
            .addCase(deleteApp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMessages } = appSlice.actions;
export default appSlice.reducer;
