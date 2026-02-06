import axiosInstance from './axiosInstance';

export const bankDetailApi = {
    /**
     * Get all user bank details for admin review
     */
    getBankDetails: async () => {
        const response = await axiosInstance.get('/api/bank-details/admin/all');
        return response.data;
    },

    /**
     * Verify (Approve/Reject) a user's bank account
     * @param {string} id - The bank detail record ID
     * @param {string} status - 'approved' or 'rejected'
     * @param {string} reason - Rejection reason if status is 'rejected'
     */
    verifyBankDetail: async (id, status, reason = '') => {
        const response = await axiosInstance.put(`/api/bank-details/admin/${id}/verify`, {
            status,
            rejectionReason: reason
        });
        return response.data;
    }
};

export default bankDetailApi;
