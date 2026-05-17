import { create } from 'zustand';
import { payrollService } from '../services/payrollService';
import { PayrollRecord, SalaryStructure, Payslip, PayrollSummary } from '../types/payroll';

interface PayrollState {
  // Data
  records: PayrollRecord[];
  currentRecord: PayrollRecord | null;
  salaryStructure: SalaryStructure | null;
  payslips: Payslip[];
  currentPayslip: Payslip | null;

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchRecords: (filters?: { month?: number; year?: number; employee_id?: string }) => Promise<void>;
  fetchPayrollDetails: (employeeId: string, month: number, year: number) => Promise<void>;
  fetchPayslips: (filters?: { employee_id?: string; month?: number; year?: number }) => Promise<void>;
  fetchPayslipById: (payslipId: string) => Promise<Payslip | null>;
  processMonthlyPayroll: (month: number, year: number) => Promise<PayrollSummary>;
  lockPayroll: (payrollId: string) => Promise<void>;
  fetchSalaryStructure: (employeeId: string) => Promise<void>;
  configureSalaryStructure: (data: any) => Promise<void>;
  generatePayslip: (employeeId: string, month: number, year: number) => Promise<void>;
  downloadPayslip: (payslipId: string) => Promise<Blob>;
  requestAdvanceSalary: (data: any) => Promise<void>;
  exportBankFile: (month: number, year: number, format: 'CSV' | 'NEFT') => Promise<Blob>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  records: [],
  currentRecord: null,
  salaryStructure: null,
  payslips: [],
  currentPayslip: null,
  loading: false,
  error: null,
};

export const usePayrollStore = create<PayrollState>((set, get) => ({
  ...initialState,

  // Fetch payroll records
  fetchRecords: async (filters) => {
    set({ loading: true, error: null });
    try {
      const result = await payrollService.getPayrollRecords(filters);
      const records = Array.isArray(result) ? result : (result as any)?.data ?? [];
      set({
        records,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Fetch payroll details
  fetchPayrollDetails: async (employeeId, month, year) => {
    set({ loading: true, error: null });
    try {
      const record = await payrollService.getPayrollDetails(employeeId, month, year);
      set({
        currentRecord: record,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Fetch payslips
  fetchPayslips: async (filters) => {
    set({ loading: true, error: null });
    try {
      const result = await payrollService.getPayslips(filters);
      const payslips = Array.isArray(result) ? result : (result as any)?.data ?? [];
      set({ payslips, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Fetch single payslip by id — does NOT set global loading so the payslip list doesn't flicker
  fetchPayslipById: async (payslipId) => {
    set({ error: null });
    try {
      const result = await payrollService.getPayslip(payslipId);
      const payslip = (result as any)?.data ?? result;
      set({ currentPayslip: payslip });
      return payslip;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  // Process monthly payroll
  processMonthlyPayroll: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const result = await payrollService.processMonthlyPayroll(month, year);
      const summary = (result as any)?.data ?? result;
      await get().fetchRecords({ month, year });
      set({ loading: false });
      return summary;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Lock payroll
  lockPayroll: async (payrollId) => {
    set({ loading: true, error: null });
    try {
      await payrollService.lockPayroll(payrollId);
      set((state) => ({
        records: state.records.map((record) =>
          record.id === payrollId ? { ...record, status: 'locked' as const } : record
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Fetch salary structure
  fetchSalaryStructure: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const structure = await payrollService.getSalaryStructure(employeeId);
      set({
        salaryStructure: structure,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Configure salary structure
  configureSalaryStructure: async (data) => {
    set({ loading: true, error: null });
    try {
      const structure = await payrollService.configureSalaryStructure(data);
      set({
        salaryStructure: structure,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Generate payslip
  generatePayslip: async (employeeId, month, year) => {
    set({ loading: true, error: null });
    try {
      const payslip = await payrollService.generatePayslip(employeeId, month, year);
      set((state) => ({
        payslips: [...state.payslips, payslip],
        loading: false,
      }));
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Download payslip — does NOT set global loading so the payslip list doesn't flicker
  downloadPayslip: async (payslipId) => {
    try {
      const blob = await payrollService.downloadPayslip(payslipId);
      return blob;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // Request advance salary
  requestAdvanceSalary: async (data) => {
    set({ loading: true, error: null });
    try {
      await payrollService.requestAdvanceSalary(data);
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Export bank file — does NOT set global loading so the payroll list doesn't flicker
  exportBankFile: async (month, year, format) => {
    set({ error: null });
    try {
      return await payrollService.exportBankFile(month, year, format);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));
