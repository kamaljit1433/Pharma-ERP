import api from './api';

export const benefitsService = {
  // ============ Insurance Plans ============

  createInsurancePlan: async (data: any) => {
    const response = await api.post('/benefits/insurance-plans', data);
    return response.data;
  },

  getInsurancePlans: async (isActive?: boolean) => {
    const response = await api.get('/benefits/insurance-plans', {
      params: { active: isActive },
    });
    return response.data;
  },

  getInsurancePlan: async (id: string) => {
    const response = await api.get(`/benefits/insurance-plans/${id}`);
    return response.data;
  },

  updateInsurancePlan: async (id: string, data: any) => {
    const response = await api.put(`/benefits/insurance-plans/${id}`, data);
    return response.data;
  },

  deleteInsurancePlan: async (id: string) => {
    const response = await api.delete(`/benefits/insurance-plans/${id}`);
    return response.data;
  },

  // ============ Insurance Enrollment ============

  enrollInInsurance: async (data: any) => {
    const response = await api.post('/benefits/insurance/enroll', data);
    return response.data;
  },

  getEmployeeEnrollments: async (employeeId: string) => {
    const response = await api.get(`/benefits/insurance/enrollments/${employeeId}`);
    return response.data;
  },

  // ============ PF Details ============

  getPFDetails: async (employeeId: string) => {
    const response = await api.get(`/benefits/pf/${employeeId}`);
    return response.data;
  },

  getPFStatement: async (
    employeeId: string,
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number
  ) => {
    const response = await api.get(`/benefits/pf/${employeeId}/statement`, {
      params: { fromMonth, fromYear, toMonth, toYear },
    });
    return response.data;
  },

  // ============ Gratuity ============

  calculateGratuity: async (employeeId: string, lastDrawnSalary: number) => {
    const response = await api.post(`/benefits/gratuity/${employeeId}/calculate`, {
      lastDrawnSalary,
    });
    return response.data;
  },

  getGratuityReport: async (employeeId: string, lastDrawnSalary: number) => {
    const response = await api.post(`/benefits/gratuity/${employeeId}/report`, {
      lastDrawnSalary,
    });
    return response.data;
  },

  // ============ Reimbursement Claims ============

  submitReimbursementClaim: async (data: any) => {
    const response = await api.post('/benefits/reimbursements', data);
    return response.data;
  },

  getReimbursementClaim: async (id: string) => {
    const response = await api.get(`/benefits/reimbursements/${id}`);
    return response.data;
  },

  getEmployeeClaims: async (employeeId: string) => {
    const response = await api.get(`/benefits/reimbursements/employee/${employeeId}`);
    return response.data;
  },

  approveClaim: async (id: string, approverId: string, approvalNotes?: string) => {
    const response = await api.put(`/benefits/reimbursements/${id}/approve`, {
      approverId,
      approvalNotes,
    });
    return response.data;
  },

  rejectClaim: async (id: string, approverId: string, approvalNotes: string) => {
    const response = await api.put(`/benefits/reimbursements/${id}/reject`, {
      approverId,
      approvalNotes,
    });
    return response.data;
  },

  // ============ Rewards ============

  awardReward: async (data: any) => {
    const response = await api.post('/benefits/rewards', data);
    return response.data;
  },

  getReward: async (id: string) => {
    const response = await api.get(`/benefits/rewards/${id}`);
    return response.data;
  },

  getEmployeeRewards: async (employeeId: string) => {
    const response = await api.get(`/benefits/rewards/employee/${employeeId}`);
    return response.data;
  },

  getPublicRewards: async () => {
    const response = await api.get('/benefits/rewards/public/all');
    return response.data;
  },

  updateReward: async (id: string, data: any) => {
    const response = await api.put(`/benefits/rewards/${id}`, data);
    return response.data;
  },

  deleteReward: async (id: string) => {
    const response = await api.delete(`/benefits/rewards/${id}`);
    return response.data;
  },
};
