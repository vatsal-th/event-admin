import axiosInstance from './axiosInstance';

/**
 * API for managing admin permissions
 */
export const permissionApi = {
    /**
     * Get all admin permission requests with pagination and filters
     * @param {number} page - Page number
     * @param {number} limit - Number of records per page
     * @param {Object} filters - Optional filters (status, startDate, endDate)
     */
    getAdminPermissions: async (page = 1, limit = 10, filters = {}) => {
        const response = await axiosInstance.get('/api/permissions/admin/all', {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    /**
     * Update an admin permission request status
     * @param {string} id - Permission ID
     * @param {string} status - New status (e.g., 'Approved', 'Rejected')
     * @param {string} rejectionReason - Optional reason for rejection
     */
    updateAdminPermission: async (id, status, rejectionReason) => {
        const response = await axiosInstance.put(`/api/permissions/admin/${id}`, {
            status,
            rejectionReason
        });
        return response.data;
    }
};

export default permissionApi;
