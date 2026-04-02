import apiClient from './api';

export const documentService = {
  // ============ Document Management ============

  uploadDocument: async (data: FormData) => {
    const response = await apiClient.post('/documents', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocument: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  updateDocument: async (id: string, data: any) => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id: string) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  getEmployeeDocuments: async (employeeId: string) => {
    const response = await apiClient.get(`/documents/employee/${employeeId}`);
    return response.data;
  },

  // ============ Document Expiry Management ============

  getExpiringDocuments: async (daysThreshold: number = 30) => {
    const response = await apiClient.get('/documents/expiring', {
      params: { daysThreshold },
    });
    return response.data;
  },

  getEmployeeExpiringDocuments: async (employeeId: string, daysThreshold: number = 30) => {
    const response = await apiClient.get(`/documents/employee/${employeeId}/expiring`, {
      params: { daysThreshold },
    });
    return response.data;
  },

  // ============ Document Verification (HR) ============

  verifyDocument: async (id: string, status: 'verified' | 'rejected', comment?: string) => {
    const response = await apiClient.put(`/documents/${id}/verify`, {
      status,
      comment,
    });
    return response.data;
  },

  getPendingDocuments: async () => {
    const response = await apiClient.get('/documents/pending/review');
    return response.data;
  },

  // ============ Document Download ============

  downloadDocument: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ============ Document Version History ============

  getDocumentVersions: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}/versions`);
    return response.data;
  },
};
