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
    },

    /**
     * Upload Admin QR Code for Top-ups
     * @param {FormData} formData - FormData containing the qrCode file
     */
    uploadAdminQrCode: async (formData) => {
        const response = await axiosInstance.post('/api/topups/admin/qr', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Get Current Top-up QR Code
     */
    getQrCode: async () => {
        const response = await axiosInstance.get('/api/topups/qr');
        return response.data;
    },

    /**
     * Delete Top-up QR Code
     */
    deleteQrCode: async () => {
        const response = await axiosInstance.delete('/api/topups/admin/qr');
        return response.data;
    }
};

export default topupApi;
