import axiosInstance from './axiosInstance';

export const employeeApi = {
    // Add new employee
    addEmployee: async (employeeData) => {
        const response = await axiosInstance.post('/api/admin/addemployee', employeeData);
        return response.data;
    },

    // Get all employees
    getAllEmployees: async () => {
        const response = await axiosInstance.get('/api/admin/employees');
        return response.data;
    },

    // Get activity logs
    getActivityLogs: async () => {
        const response = await axiosInstance.get('/api/admin/activitylogs');
        return response.data;
    },

    // Update employee
    updateEmployee: async (employeeId, employeeData) => {
        const response = await axiosInstance.put(`/api/admin/employee/${employeeId}`, employeeData);
        return response.data;
    },

    // Delete employee
    deleteEmployee: async (employeeId) => {
        const response = await axiosInstance.delete(`/api/admin/employee/${employeeId}`);
        return response.data;
    },
};

export default employeeApi;