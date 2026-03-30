import api from './api';

export const performanceService = {
  // ============ Goals ============

  createGoal: async (data: any) => {
    const response = await api.post('/performance/goals', data);
    return response.data;
  },

  getGoal: async (id: string) => {
    const response = await api.get(`/performance/goals/${id}`);
    return response.data;
  },

  getEmployeeGoals: async (employeeId: string, cycleId?: string) => {
    const response = await api.get(`/performance/goals/employee/${employeeId}`, {
      params: { cycleId },
    });
    return response.data;
  },

  updateGoal: async (id: string, data: any) => {
    const response = await api.put(`/performance/goals/${id}`, data);
    return response.data;
  },

  updateGoalProgress: async (id: string, currentValue: number, comment?: string) => {
    const response = await api.put(`/performance/goals/${id}/progress`, {
      currentValue,
      comment,
    });
    return response.data;
  },

  deleteGoal: async (id: string) => {
    const response = await api.delete(`/performance/goals/${id}`);
    return response.data;
  },

  // ============ Review Cycles ============

  createReviewCycle: async (data: any) => {
    const response = await api.post('/performance/review-cycles', data);
    return response.data;
  },

  getReviewCycle: async (id: string) => {
    const response = await api.get(`/performance/review-cycles/${id}`);
    return response.data;
  },

  getReviewCycles: async (status?: string) => {
    const response = await api.get('/performance/review-cycles', {
      params: { status },
    });
    return response.data;
  },

  updateReviewCycle: async (id: string, data: any) => {
    const response = await api.put(`/performance/review-cycles/${id}`, data);
    return response.data;
  },

  transitionCycleStatus: async (id: string, newStatus: string) => {
    const response = await api.put(`/performance/review-cycles/${id}/status`, {
      status: newStatus,
    });
    return response.data;
  },

  deleteReviewCycle: async (id: string) => {
    const response = await api.delete(`/performance/review-cycles/${id}`);
    return response.data;
  },

  // ============ Performance Reviews ============

  submitReview: async (data: any) => {
    const response = await api.post('/performance/reviews', data);
    return response.data;
  },

  getReview: async (id: string) => {
    const response = await api.get(`/performance/reviews/${id}`);
    return response.data;
  },

  getEmployeeReviews: async (employeeId: string, cycleId?: string) => {
    const response = await api.get(`/performance/reviews/employee/${employeeId}`, {
      params: { cycleId },
    });
    return response.data;
  },

  updateReview: async (id: string, data: any) => {
    const response = await api.put(`/performance/reviews/${id}`, data);
    return response.data;
  },

  // ============ Feedback ============

  provideFeedback: async (data: any) => {
    const response = await api.post('/performance/feedback', data);
    return response.data;
  },

  getFeedback: async (id: string) => {
    const response = await api.get(`/performance/feedback/${id}`);
    return response.data;
  },

  getEmployeeFeedback: async (employeeId: string) => {
    const response = await api.get(`/performance/feedback/employee/${employeeId}`);
    return response.data;
  },

  getFeedbackGiven: async (employeeId: string) => {
    const response = await api.get(`/performance/feedback/given/${employeeId}`);
    return response.data;
  },

  // ============ PIPs ============

  initiatePIP: async (data: any) => {
    const response = await api.post('/performance/pips', data);
    return response.data;
  },

  getPIP: async (id: string) => {
    const response = await api.get(`/performance/pips/${id}`);
    return response.data;
  },

  getActivePIPs: async () => {
    const response = await api.get('/performance/pips/active');
    return response.data;
  },

  getEmployeePIPs: async (employeeId: string) => {
    const response = await api.get(`/performance/pips/employee/${employeeId}`);
    return response.data;
  },

  recordPIPCheckIn: async (pipId: string, data: any) => {
    const response = await api.post(`/performance/pips/${pipId}/check-in`, data);
    return response.data;
  },

  recordPIPOutcome: async (pipId: string, outcome: string, notes?: string) => {
    const response = await api.put(`/performance/pips/${pipId}/outcome`, {
      outcome,
      notes,
    });
    return response.data;
  },

  // ============ Dashboard ============

  getPerformanceDashboard: async () => {
    const response = await api.get('/performance/dashboard');
    return response.data;
  },

  getGoalCompletionStats: async (cycleId?: string) => {
    const response = await api.get('/performance/stats/goal-completion', {
      params: { cycleId },
    });
    return response.data;
  },

  getReviewRatingsDistribution: async (cycleId?: string) => {
    const response = await api.get('/performance/stats/review-ratings', {
      params: { cycleId },
    });
    return response.data;
  },

  getFeedbackSentimentBreakdown: async () => {
    const response = await api.get('/performance/stats/feedback-sentiment');
    return response.data;
  },
};
