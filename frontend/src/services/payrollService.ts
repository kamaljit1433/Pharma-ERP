import api from './api';

export const payrollService = {
  // Salary Structure
  configureSalaryStructure: async (data: any) => {
    const response = await api.post('/payroll/salary-structure', data);
    return response.data;
  },

  getSalaryStructure: async (employeeId: string) => {
    const response = await api.get(`/payroll/salary-structure/${employeeId}`);
    return response.data;
  },

  // Payroll Processing
  processMonthlyPayroll: async (month: number, year: number) => {
    const response = await api.post('/payroll/process', { month, year });
    return response.data;
  },

  getPayrollDetails: async (employeeId: string, month: number, year: number) => {
    const response = await api.get(`/payroll/${employeeId}/${month}/${year}`);
    return response.data;
  },

  lockPayroll: async (payrollId: string) => {
    const response = await api.put(`/payroll/${payrollId}/lock`, {});
    return response.data;
  },

  // Payslips
  getPayslip: async (payslipId: string) => {
    const response = await api.get(`/payroll/payslip/${payslipId}`);
    return response.data;
  },

  downloadPayslip: async (payslipId: string) => {
    const response = await api.get(`/payroll/payslip/${payslipId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Advance Salary
  requestAdvanceSalary: async (data: any) => {
    const response = await api.post('/payroll/advance', data);
    return response.data;
  },

  // Export
  exportBankFile: async (month: number, year: number, format: 'CSV' | 'NEFT') => {
    const response = await api.get(`/payroll/export/${month}/${year}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
