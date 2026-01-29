import axiosInstance from './axiosInstance';

const countryApi = {
    // Get all countries
    getAllCountries: async () => {
        const response = await axiosInstance.get('/api/admin/countries');
        return response.data;
    },

    // Add new country
    addCountry: async (countryData) => {
        const response = await axiosInstance.post('/api/admin/country', countryData);
        return response.data;
    },

    // Update country
    updateCountry: async (id, countryData) => {
        const response = await axiosInstance.put(`/api/admin/country/${id}`, countryData);
        return response.data;
    },

    // Delete country
    deleteCountry: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/country/${id}`);
        return response.data;
    }
};

export default countryApi;
