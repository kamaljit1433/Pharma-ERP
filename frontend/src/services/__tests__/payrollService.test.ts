import { describe, it, expect, vi, beforeEach } from 'vitest';
import { payrollService } from '../payrollService';
import apiClient from '../api';

// Mock the API client
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Payroll Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Salary Structure', () => {
    it('should configure salary structure', async () => {
      const mockData = {
        employee_id: 'emp-001',
        basic_salary: 50000,
        hra: 10000,
        allowances: { travel: 5000 },
        deductions: { pf: 6000 },
      };

      const mockResponse = { ...mockData, id: 'struct-001' };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await payrollService.configureSalaryStructure(mockData);

      expect(apiClient.post).toHaveBeenCalledWith('/payroll/salary-structure', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should get salary structure for employee', async () => {
      const employeeId = 'emp-001';
      const mockStructure = {
        id: 'struct-001',
        employee_id: employeeId,
        basic_salary: 50000,
        hra: 10000,
        allowances: { travel: 5000 },
        deductions: { pf: 6000 },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStructure });

      const result = await payrollService.getSalaryStructure(employeeId);

      expect(apiClient.get).toHaveBeenCalledWith(`/payroll/salary-structure/${employeeId}`);
      expect(result).toEqual(mockStructure);
    });
  });

  describe('Payroll Processing', () => {
    it('should process monthly payroll', async () => {
      const mockResponse = {
        total_employees: 10,
        total_gross_salary: 500000,
        total_deductions: 50000,
        total_net_salary: 450000,
        processed_count: 10,
        pending_count: 0,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await payrollService.processMonthlyPayroll(1, 2024);

      expect(apiClient.post).toHaveBeenCalledWith('/payroll/process', { month: 1, year: 2024 });
      expect(result).toEqual(mockResponse);
    });

    it('should get payroll details for employee', async () => {
      const mockDetails = {
        id: 'payroll-001',
        employee_id: 'emp-001',
        month: 1,
        year: 2024,
        gross_salary: 50000,
        net_salary: 45000,
        deductions: 5000,
        status: 'processed',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDetails });

      const result = await payrollService.getPayrollDetails('emp-001', 1, 2024);

      expect(apiClient.get).toHaveBeenCalledWith('/payroll/emp-001/1/2024');
      expect(result).toEqual(mockDetails);
    });

    it('should get payroll records with filters', async () => {
      const mockRecords = [
        {
          id: 'payroll-001',
          employee_id: 'emp-001',
          month: 1,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          deductions: 5000,
          status: 'processed',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRecords });

      const filters = { month: 1, year: 2024 };
      const result = await payrollService.getPayrollRecords(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/payroll/records', { params: filters });
      expect(result).toEqual(mockRecords);
    });

    it('should lock payroll', async () => {
      const payrollId = 'payroll-001';
      const mockResponse = {
        id: payrollId,
        status: 'locked',
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: mockResponse });

      const result = await payrollService.lockPayroll(payrollId);

      expect(apiClient.put).toHaveBeenCalledWith(`/payroll/${payrollId}/lock`, {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Payslip Generation', () => {
    it('should generate payslip', async () => {
      const mockPayslip = {
        id: 'payslip-001',
        payroll_id: 'payroll-001',
        employee_id: 'emp-001',
        month: 1,
        year: 2024,
        generated_at: '2024-01-15T10:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockPayslip });

      const result = await payrollService.generatePayslip('emp-001', 1, 2024);

      expect(apiClient.post).toHaveBeenCalledWith('/payroll/payslip/generate', {
        employee_id: 'emp-001',
        month: 1,
        year: 2024,
      });
      expect(result).toEqual(mockPayslip);
    });

    it('should get payslip', async () => {
      const payslipId = 'payslip-001';
      const mockPayslip = {
        id: payslipId,
        payroll_id: 'payroll-001',
        employee_id: 'emp-001',
        month: 1,
        year: 2024,
        generated_at: '2024-01-15T10:00:00Z',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPayslip });

      const result = await payrollService.getPayslip(payslipId);

      expect(apiClient.get).toHaveBeenCalledWith(`/payroll/payslip/${payslipId}`);
      expect(result).toEqual(mockPayslip);
    });

    it('should download payslip as PDF', async () => {
      const payslipId = 'payslip-001';
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBlob });

      const result = await payrollService.downloadPayslip(payslipId);

      expect(apiClient.get).toHaveBeenCalledWith(`/payroll/payslip/${payslipId}/download`, {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('Advance Salary', () => {
    it('should request advance salary', async () => {
      const mockRequest = {
        employee_id: 'emp-001',
        amount: 10000,
        reason: 'Emergency',
      };

      const mockResponse = {
        id: 'advance-001',
        ...mockRequest,
        status: 'pending',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await payrollService.requestAdvanceSalary(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/payroll/advance', mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Export', () => {
    it('should export bank file as CSV', async () => {
      const mockBlob = new Blob(['CSV content'], { type: 'text/csv' });

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBlob });

      const result = await payrollService.exportBankFile(1, 2024, 'CSV');

      expect(apiClient.get).toHaveBeenCalledWith('/payroll/export/1/2024', {
        params: { format: 'CSV' },
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });

    it('should export bank file as NEFT', async () => {
      const mockBlob = new Blob(['NEFT content'], { type: 'text/plain' });

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBlob });

      const result = await payrollService.exportBankFile(1, 2024, 'NEFT');

      expect(apiClient.get).toHaveBeenCalledWith('/payroll/export/1/2024', {
        params: { format: 'NEFT' },
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });
});
