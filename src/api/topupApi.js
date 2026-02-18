import axiosInstance from './axiosInstance';

export const topupApi = {
    /**
     * Get all top-up requests for Admin
     */
    getAllTopups: async () => {
        const response = await axiosInstance.get('/api/topups/admin/all');
        return response.data;
    },

    /**
     * Update top-up request status (Approve/Reject)
     * @param {string} id - The ID of the top-up request
     * @param {string} status - The new status ('Approved' or 'Rejected')
     */
    updateTopupStatus: async (id, status) => {
        const response = await axiosInstance.put(`/api/topups/admin/update/${id}`, { status });
        return response.data;
    },

    /**
     * Get Admin profile/me to get real-time balance
     */
    getAdminProfile: async () => {
        const response = await axiosInstance.get('/api/auth/me');
        return response.data;
    }
};

export default topupApi;
