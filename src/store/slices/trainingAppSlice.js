import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import trainingAppApi from '../../api/trainingAppApi';

// Async thunks
export const fetchTrainingApps = createAsyncThunk(
    'trainingApps/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await trainingAppApi.getAllTrainingApps();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch training apps');
        }
    }
);

export const createTrainingApp = createAsyncThunk(
    'trainingApps/create',
    async (appData, { rejectWithValue }) => {
        try {
            const data = await trainingAppApi.createTrainingApp(appData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create training app');
        }
    }
);

export const updateTrainingApp = createAsyncThunk(
    'trainingApps/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const result = await trainingAppApi.updateTrainingApp(id, data);
            return result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update training app');
        }
    }
);

export const deleteTrainingApp = createAsyncThunk(
    'trainingApps/delete',
    async (id, { rejectWithValue }) => {
        try {
            await trainingAppApi.deleteTrainingApp(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete training app');
        }
    }
);

export const fetchTrainingAppVideos = createAsyncThunk(
    'trainingApps/fetchVideos',
    async (appId, { rejectWithValue }) => {
        try {
            const data = await trainingAppApi.getTrainingAppVideos(appId);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos');
        }
    }
);

export const addVideo = createAsyncThunk(
    'trainingApps/addVideo',
    async ({ appId, data }, { rejectWithValue }) => {
        try {
            const result = await trainingAppApi.addVideo(appId, data);
            return result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add video');
        }
    }
);

export const deleteVideo = createAsyncThunk(
    'trainingApps/deleteVideo',
    async (videoId, { rejectWithValue }) => {
        try {
            await trainingAppApi.deleteVideo(videoId);
            return videoId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete video');
        }
    }
);

const trainingAppSlice = createSlice({
    name: 'trainingApps',
    initialState: {
        apps: [],
        currentApp: null,
        videos: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentApp: (state, action) => {
            state.currentApp = action.payload;
        },
        clearVideos: (state) => {
            state.videos = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all training apps
            .addCase(fetchTrainingApps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrainingApps.fulfilled, (state, action) => {
                state.loading = false;
                state.apps = action.payload.data || action.payload;
            })
            .addCase(fetchTrainingApps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create training app
            .addCase(createTrainingApp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTrainingApp.fulfilled, (state, action) => {
                state.loading = false;
                state.apps.push(action.payload.data || action.payload);
            })
            .addCase(createTrainingApp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update training app
            .addCase(updateTrainingApp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTrainingApp.fulfilled, (state, action) => {
                state.loading = false;
                const updatedApp = action.payload.data || action.payload;
                const index = state.apps.findIndex(app => app._id === updatedApp._id);
                if (index !== -1) {
                    state.apps[index] = updatedApp;
                }
            })
            .addCase(updateTrainingApp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete training app
            .addCase(deleteTrainingApp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTrainingApp.fulfilled, (state, action) => {
                state.loading = false;
                state.apps = state.apps.filter(app => app._id !== action.payload);
            })
            .addCase(deleteTrainingApp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch videos
            .addCase(fetchTrainingAppVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrainingAppVideos.fulfilled, (state, action) => {
                state.loading = false;
                state.videos = action.payload.data || action.payload;
            })
            .addCase(fetchTrainingAppVideos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add video
            .addCase(addVideo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addVideo.fulfilled, (state, action) => {
                state.loading = false;
                state.videos.push(action.payload.data || action.payload);
            })
            .addCase(addVideo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete video
            .addCase(deleteVideo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVideo.fulfilled, (state, action) => {
                state.loading = false;
                state.videos = state.videos.filter(video => video._id !== action.payload);
            })
            .addCase(deleteVideo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setCurrentApp, clearVideos } = trainingAppSlice.actions;
export default trainingAppSlice.reducer;
