import axiosInstance from './axiosInstance';

export const complaintApi = {
    getAllComplaints: async () => {
        const response = await axiosInstance.get('/api/admin/complaints');
        return response.data;
    },

    getComplaintById: async (id) => {
        const response = await axiosInstance.get(`/api/admin/complaints/${id}`);
        return response.data;
    },

    resolveComplaint: async (id, resolutionNote) => {
        const response = await axiosInstance.put(`/api/admin/complaints/${id}/resolve`, {
            resolutionNote,
        });
        return response.data;
    },
};

export default complaintApi;
