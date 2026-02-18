import axiosInstance from './axiosInstance';

export const salaryApi = {
    uploadSalaryCsv: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/api/salary/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getSalaryRecords: async (page = 1, limit = 20, search = '') => {
        const response = await axiosInstance.get('/api/salary/records', {
            params: { page, limit, search }
        });
        return response.data;
    },
    clearAllRecords: async () => {
        const response = await axiosInstance.delete('/api/salary/records');
        return response.data;
    }
};

export default salaryApi;
