import axiosInstance from './axiosInstance';

const categoryApi = {
    // Get all categories
    getAllCategories: async () => {
        const response = await axiosInstance.get('/api/admin/categories');
        return response.data;
    },

    // Add new category
    addCategory: async (categoryData) => {
        const response = await axiosInstance.post('/api/admin/category', categoryData);
        return response.data;
    },

    // Update category
    updateCategory: async (id, categoryData) => {
        const response = await axiosInstance.put(`/api/admin/category/${id}`, categoryData);
        return response.data;
    },

    // Delete category
    deleteCategory: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/category/${id}`);
        return response.data;
    }
};

export default categoryApi;
