import axiosInstance from './axiosInstance';

const notificationApi = {
    /**
     * Send a global notification to all users
     * @param {Object} data - { title, message, isGlobal: true }
     */
    createGlobalNotification: async (data) => {
        const response = await axiosInstance.post('/api/notifications', data);
        return response.data;
    },

    /**
     * Send a personal notification to a specific user by email
     * @param {Object} data - { email, title, message }
     */
    createPersonalNotification: async (data) => {
        const response = await axiosInstance.post('/api/notifications', data);
        return response.data;
    },

    /**
     * Get all manually created messages/notifications for admin history
     */
    getAdminNotificationHistory: async () => {
        const response = await axiosInstance.get('/api/notifications/admin/all');
        return response.data;
    },

    /**
     * Update an existing notification
     * @param {string} id - Notification ID
     * @param {Object} data - Updated notification data
     */
    updateNotification: async (id, data) => {
        const response = await axiosInstance.put(`/api/notifications/admin/${id}`, data);
        return response.data;
    },

    /**
     * Delete a notification
     * @param {string} id - Notification ID
     */
    deleteNotification: async (id) => {
        const response = await axiosInstance.delete(`/api/notifications/admin/${id}`);
        return response.data;
    }
};

export default notificationApi;
