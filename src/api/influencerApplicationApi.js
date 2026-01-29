import axiosInstance from './axiosInstance';

export const influencerApplicationApi = {
    getAllApplications: async () => {
        const response = await axiosInstance.get('/api/influencer/admin/applications');
        return response.data;
    },

    updateApplicationStatus: async (id, status) => {
        const response = await axiosInstance.put(`/api/influencer/admin/application/${id}`, { status });
        return response.data;
    }
};

export default influencerApplicationApi;
