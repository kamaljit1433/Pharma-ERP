import { create } from 'zustand';
import { payrollService } from '../services/payrollService';

interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  deductions: number;
  status: 'draft' | 'processed' | 'locked';
  created_at?: string;
  updated_at?: string;
}

interface SalaryStructure {
  id: string;
  employee_id: string;
  basic_salary: number;
  hra: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
}

interface Payslip {
  id: string;
  payroll_id: string;
  employee_id: string;
  month: number;
  year: number;
  generated_at: string;
}

interface PayrollState {
  // Data
  records: PayrollRecord[];
  currentRecord: PayrollRecord | null;
  salaryStructure: SalaryStructure | null;
  payslips: Payslip[];

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchRecords: (filters?: { month?: number; year?: number; employee_id?: string }) => Promise<void>;
  fetchPayrollDetails: (employeeId: string, month: number, year: number) => Promise<void>;
  processMonthlyPayroll: (month: number, year: number) => Promise<void>;
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
  loading: false,
  error: null,
};

export const usePayrollStore = create<PayrollState>((set, get) => ({
  ...initialState,

  // Fetch payroll records
  fetchRecords: async (filters) => {
    set({ loading: true, error: null });
    try {
      const records = await payrollService.getPayrollRecords(filters);
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

  // Process monthly payroll
  processMonthlyPayroll: async (month, year) => {
    set({ loading: true, error: null });
    try {
      await payrollService.processMonthlyPayroll(month, year);
      // Refresh records
      await get().fetchRecords({ month, year });
      set({ loading: false });
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

  // Download payslip
  downloadPayslip: async (payslipId) => {
    set({ loading: true, error: null });
    try {
      const blob = await payrollService.downloadPayslip(payslipId);
      set({ loading: false });
      return blob;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
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

  // Export bank file
  exportBankFile: async (month, year, format) => {
    set({ loading: true, error: null });
    try {
      const blob = await payrollService.exportBankFile(month, year, format);
      set({ loading: false });
      return blob;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));
