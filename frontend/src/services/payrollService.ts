import apiClient from './api';

export const payrollService = {
  // Salary Structure
  configureSalaryStructure: async (data: any) => {
    const response = await apiClient.post('/payroll/salary-structure', data);
    return response.data;
  },

  getSalaryStructure: async (employeeId: string) => {
    const response = await apiClient.get(`/payroll/salary-structure/${employeeId}`);
    return response.data;
  },

  // Payroll Processing
  processMonthlyPayroll: async (month: number, year: number) => {
    const response = await apiClient.post('/payroll/process', { month, year });
    return response.data;
  },

  getPayrollDetails: async (employeeId: string, month: number, year: number) => {
    const response = await apiClient.get(`/payroll/${employeeId}/${month}/${year}`);
    return response.data;
  },

  getPayrollRecords: async (filters?: { month?: number; year?: number; employee_id?: string }) => {
    const response = await apiClient.get('/payroll/records', { params: filters });
    return response.data;
  },

  lockPayroll: async (payrollId: string) => {
    const response = await apiClient.put(`/payroll/${payrollId}/lock`, {});
    return response.data;
  },

  // Payslips
  getPayslip: async (payslipId: string) => {
    const response = await apiClient.get(`/payroll/payslip/${payslipId}`);
    return response.data;
  },

  generatePayslip: async (employeeId: string, month: number, year: number) => {
    const response = await apiClient.post('/payroll/payslip/generate', {
      employee_id: employeeId,
      month,
      year,
    });
    return response.data;
  },

  downloadPayslip: async (payslipId: string) => {
    const response = await apiClient.get(`/payroll/payslip/${payslipId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Advance Salary
  requestAdvanceSalary: async (data: any) => {
    const response = await apiClient.post('/payroll/advance', data);
    return response.data;
  },

  // Export
  exportBankFile: async (month: number, year: number, format: 'CSV' | 'NEFT') => {
    const response = await apiClient.get(`/payroll/export/${month}/${year}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
