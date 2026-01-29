import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import countryApi from '../../api/countryApi';

// Async thunks
export const fetchCountries = createAsyncThunk(
    'countries/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await countryApi.getAllCountries();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch countries');
        }
    }
);

export const addCountry = createAsyncThunk(
    'countries/add',
    async (countryData, { rejectWithValue }) => {
        try {
            const response = await countryApi.addCountry(countryData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add country');
        }
    }
);

export const updateCountry = createAsyncThunk(
    'countries/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await countryApi.updateCountry(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update country');
        }
    }
);

export const deleteCountry = createAsyncThunk(
    'countries/delete',
    async (id, { rejectWithValue }) => {
        try {
            await countryApi.deleteCountry(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete country');
        }
    }
);

const countrySlice = createSlice({
    name: 'countries',
    initialState: {
        countries: [],
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
            // Fetch countries
            .addCase(fetchCountries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCountries.fulfilled, (state, action) => {
                state.loading = false;
                state.countries = action.payload;
            })
            .addCase(fetchCountries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add country
            .addCase(addCountry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addCountry.fulfilled, (state, action) => {
                state.loading = false;
                state.countries.push(action.payload);
                state.success = 'Country added successfully';
            })
            .addCase(addCountry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update country
            .addCase(updateCountry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateCountry.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.countries.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.countries[index] = action.payload;
                }
                state.success = 'Country updated successfully';
            })
            .addCase(updateCountry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete country
            .addCase(deleteCountry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteCountry.fulfilled, (state, action) => {
                state.loading = false;
                state.countries = state.countries.filter(c => c._id !== action.payload);
                state.success = 'Country deleted successfully';
            })
            .addCase(deleteCountry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMessages } = countrySlice.actions;
export default countrySlice.reducer;
