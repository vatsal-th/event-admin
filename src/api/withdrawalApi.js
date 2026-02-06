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
    }
};

export default withdrawalApi;
