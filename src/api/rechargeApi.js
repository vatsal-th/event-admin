import axiosInstance from "./axiosInstance";

export const rechargeApi = {
  /**
   * Get all recharge requests for Admin
   */
  getAllRecharges: async () => {
    const response = await axiosInstance.get("/api/recharge/admin/all");
    return response.data;
  },

  /**
   * Update recharge request status (Approve/Reject)
   * @param {string} id - The ID of the recharge request
   * @param {object} updateData - { status: 'Approved' | 'Rejected', adminNote: string }
   */
  updateRechargeStatus: async (id, updateData) => {
    const response = await axiosInstance.put(
      `/api/recharge/admin/update/${id}`,
      updateData,
    );
    return response.data;
  },
};

export default rechargeApi;
