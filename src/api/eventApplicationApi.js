import axiosInstance from './axiosInstance';

export const eventApplicationApi = {
    getAllApplications: async () => {
        const response = await axiosInstance.get('/api/events/admin/applications');
        return response.data;
    },

    updateApplicationStatus: async (id, status) => {
        const response = await axiosInstance.put(`/api/events/admin/application/${id}`, { status });
        return response.data;
    }
};

export default eventApplicationApi;
