import axiosInstance from './axiosInstance';

export const withdrawalApi = {
    /**
     * Get all withdrawal requests for admin
     */
    getWithdrawals: async () => {
        const response = await axiosInstance.get('/api/withdrawals/admin/all');
        return response.data;
    },

    /**
     * Approve a withdrawal request
     * @param {string} id - Withdrawal record ID
     */
    approveWithdrawal: async (id) => {
        const response = await axiosInstance.put(`/api/withdrawals/admin/${id}/approve`);
        return response.data;
    },

    /**
     * Reject a withdrawal request
     * @param {string} id - Withdrawal record ID
     * @param {string} reason - Rejection reason
     */
    rejectWithdrawal: async (id, reason) => {
        const response = await axiosInstance.put(`/api/withdrawals/admin/${id}/reject`, {
            reason
        });
        return response.data;
    },

    /**
     * Get withdrawal history for admin with filters
     * @param {string} status - Optional status filter (pending, approved, rejected)
     */
    getWithdrawalHistory: async (status) => {
        const response = await axiosInstance.get('/api/withdrawals/admin/all', {
            params: { status }
        });
        return response.data;
    },

    /**
     * Get withdrawal stats summary for admin
     */
    getWithdrawalStats: async () => {
        const response = await axiosInstance.get('/api/withdrawals/admin/stats/summary');
        return response.data;
    }
};

export default withdrawalApi;