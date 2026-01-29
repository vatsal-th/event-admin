import axiosInstance from './axiosInstance';

const appApi = {
    // Get all apps
    getAllApps: async () => {
        const response = await axiosInstance.get('/api/admin/apps');
        return response.data;
    },

    // Add new app
    addApp: async (appData) => {
        const response = await axiosInstance.post('/api/admin/app', appData);
        return response.data;
    },

    // Update app
    updateApp: async (id, appData) => {
        const response = await axiosInstance.put(`/api/admin/app/${id}`, appData);
        return response.data;
    },

    // Delete app
    deleteApp: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/app/${id}`);
        return response.data;
    }
};

export default appApi;
