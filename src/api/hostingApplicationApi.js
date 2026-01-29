import axiosInstance from './axiosInstance';

export const hostingApplicationApi = {
    getAllApplications: async () => {
        const response = await axiosInstance.get('/api/hosting/admin/applications');
        return response.data;
    },

    updateApplicationStatus: async (id, status) => {
        const response = await axiosInstance.put(`/api/hosting/admin/application/${id}`, { status });
        return response.data;
    }
};

export default hostingApplicationApi;
