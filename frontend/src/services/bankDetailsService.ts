import api from './api';

export const bankDetailsService = {
  // ============ Bank Account Management ============

  addBankAccount: async (data: any) => {
    const response = await api.post('/bank-details', data);
    return response.data;
  },

  updateBankAccount: async (id: string, data: any) => {
    const response = await api.put(`/bank-details/${id}`, data);
    return response.data;
  },

  setBankAccountPrimary: async (id: string) => {
    const response = await api.put(`/bank-details/${id}/set-primary`, {});
    return response.data;
  },

  verifyBankAccount: async (id: string) => {
    const response = await api.put(`/bank-details/${id}/verify`, {});
    return response.data;
  },

  getBankDetails: async (employeeId: string) => {
    const response = await api.get(`/bank-details/${employeeId}`);
    return response.data;
  },

  deleteBankAccount: async (id: string) => {
    const response = await api.delete(`/bank-details/${id}`);
    return response.data;
  },

  // ============ Bank Account Verification (Finance) ============

  getPendingVerifications: async () => {
    const response = await api.get('/bank-details/pending/verifications');
    return response.data;
  },

  approveBankVerification: async (id: string, approverId: string) => {
    const response = await api.put(`/bank-details/${id}/verify`, {
      approverId,
      status: 'approved',
    });
    return response.data;
  },

  rejectBankVerification: async (id: string, approverId: string, reason: string) => {
    const response = await api.put(`/bank-details/${id}/verify`, {
      approverId,
      status: 'rejected',
      reason,
    });
    return response.data;
  },
};
