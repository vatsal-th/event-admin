import axiosInstance from './axiosInstance';

export const authApi = {
    // Admin login
    adminLogin: async (email, password) => {
        const response = await axiosInstance.post('/api/auth/admin-login', {
            email,
            password,
        });
        return response.data;
    },

    // Logout
    logout: async () => {
        // If you have a logout endpoint on backend, call it here
        // const response = await axiosInstance.post('/api/auth/logout');
        // return response.data;
        return Promise.resolve();
    },
};

export default authApi;
