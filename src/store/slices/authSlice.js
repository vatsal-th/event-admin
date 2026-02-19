import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';

// Initial state
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
    'auth/adminLogin',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const data = await authApi.adminLogin(email, password);

            // Store token and user in localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
                const { token, ...user } = data;
                localStorage.setItem('user', JSON.stringify(user));
            }

            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Set credentials from localStorage (for persistence)
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },

        // Logout (synchronous)
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
    extraReducers: (builder) => {
        builder
            // Admin Login
            .addCase(adminLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                // De-structure token and user from the flat response
                const { token, ...user } = action.payload;
                state.user = user;
                state.token = token;
                state.error = null;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload;
            })

            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = null;
            });
    },
});

export const { clearError, setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
