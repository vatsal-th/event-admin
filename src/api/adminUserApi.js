import axiosInstance from "./axiosInstance";

export const adminUserApi = {
  /**
   * Get all users list
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get("/api/admin/users");
    return response.data;
  },

  /**
   * Freeze/Unfreeze User Wallet
   * @param {string} userId - The user ID
   * @param {boolean} isFrozen - Current freeze status to be set
   */
  toggleFreezeWallet: async (userId, isWalletFrozen) => {
    const response = await axiosInstance.put(
      `/api/admin/users/${userId}/freeze`,
      { isWalletFrozen },
    );
    return response.data;
  },

  /**
   * Adjust User Balance (Add or Cut points)
   * @param {string} userId - The user ID
   * @param {number} amount - Amount to adjust
   * @param {string} action - 'add' or 'cut'
   * @param {string} reason - Reason for adjustment
   */
  adjustBalance: async (userId, { amount, action, reason }) => {
    const response = await axiosInstance.put(
      `/api/admin/users/${userId}/balance`,
      {
        amount,
        action,
        reason,
      },
    );
    return response.data;
  },
  /**
   * Toggle user active/inactive status
   * @param {string} userId - The user ID
   * @param {boolean} isActive - Status to set
   */
  toggleUserStatus: async (userId, isActive) => {
    const response = await axiosInstance.put(
      `/api/admin/users/${userId}/status`,
      { isActive },
    );
    return response.data;
  },
};

export default adminUserApi;
