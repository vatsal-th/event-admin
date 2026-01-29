import axiosInstance from './axiosInstance';

export const trainingAppApi = {
    // Training Apps CRUD
    getAllTrainingApps: async () => {
        const response = await axiosInstance.get('/api/admin/training-apps');
        return response.data;
    },

    createTrainingApp: async (data) => {
        const response = await axiosInstance.post('/api/admin/training-apps', data);
        return response.data;
    },

    updateTrainingApp: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/training-apps/${id}`, data);
        return response.data;
    },

    deleteTrainingApp: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/training-apps/${id}`);
        return response.data;
    },

    // Videos Management
    getTrainingAppVideos: async (appId) => {
        const response = await axiosInstance.get(`/api/admin/training-apps/${appId}/videos`);
        return response.data;
    },

    addVideo: async (appId, data) => {
        const response = await axiosInstance.post(`/api/admin/training-apps/${appId}/videos`, data);
        return response.data;
    },

    deleteVideo: async (videoId) => {
        const response = await axiosInstance.delete(`/api/admin/videos/${videoId}`);
        return response.data;
    },

    // Optional: Reorder videos
    reorderVideos: async (appId, videoIds) => {
        const response = await axiosInstance.put(`/api/admin/training-apps/${appId}/videos/reorder`, {
            videoIds
        });
        return response.data;
    },
};

export default trainingAppApi;
