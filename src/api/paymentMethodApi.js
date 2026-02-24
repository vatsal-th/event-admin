import axiosInstance from "./axiosInstance";

export const paymentMethodApi = {
  /**
   * Get all payment methods for Admin
   */
  getAllPaymentMethods: async () => {
    const response = await axiosInstance.get(
      "/api/topups/admin/payment-methods",
    );
    return response.data;
  },

  /**
   * Add new payment method
   * @param {FormData} formData - FormData containing payment method details and optional qrCode file
   */
  addPaymentMethod: async (formData) => {
    const response = await axiosInstance.post(
      "/api/topups/admin/payment-methods",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Update payment method
   * @param {string} id - The ID of the payment method
   * @param {FormData} formData - FormData containing updated details
   */
  updatePaymentMethod: async (id, formData) => {
    const response = await axiosInstance.put(
      `/api/topups/admin/payment-methods/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Delete payment method
   * @param {string} id - The ID of the payment method to delete
   */
  deletePaymentMethod: async (id) => {
    const response = await axiosInstance.delete(
      `/api/topups/admin/payment-methods/${id}`,
    );
    return response.data;
  },
};

export default paymentMethodApi;
