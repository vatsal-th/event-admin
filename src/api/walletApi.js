import axiosInstance from './axiosInstance';

export const walletApi = {
    /**
     * Get Admin wallet summary (balance and total earned)
     */
    getWalletSummary: async () => {
        const response = await axiosInstance.get('/api/wallet/summary');
        return response.data;
    },

    /**
     * Get Admin transaction history (Credit/Debit Log)
     * @param {string} type - Optional type filter (credit, debit)
     */
    getWalletTransactions: async (type) => {
        const response = await axiosInstance.get('/api/wallet/transactions', {
            params: { type }
        });
        return response.data;
    }
};

export default walletApi;
