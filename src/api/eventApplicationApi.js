import axiosInstance from './axiosInstance';

export const eventApplicationApi = {
    getAllApplications: async () => {
        const response = await axiosInstance.get('/api/events/admin/applications');
        return response.data;
    },

    updateApplicationStatus: async (id, statusData) => {
        const isFormData = statusData instanceof FormData;
        const response = await axiosInstance.put(`/api/events/admin/application/${id}`, statusData, {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data;
    }
};

export default eventApplicationApi;
