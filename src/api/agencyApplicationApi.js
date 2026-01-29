import axiosInstance from './axiosInstance';

export const agencyApplicationApi = {
    getAllApplications: async () => {
        const response = await axiosInstance.get('/api/agency/admin/applications');
        return response.data;
    },

    updateApplicationStatus: async (id, status) => {
        const response = await axiosInstance.put(`/api/agency/admin/application/${id}`, { status });
        return response.data;
    }
};

export default agencyApplicationApi;
