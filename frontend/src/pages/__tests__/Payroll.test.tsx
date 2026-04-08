import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Payroll from '../Payroll';
import * as payrollStore from '@/store/payrollStore';
import * as authStore from '@/store/authStore';
import { UserRole } from '@/types/auth';

// Mock the stores
vi.mock('@/store/payrollStore', () => ({
  usePayrollStore: vi.fn(),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the MainLayout component
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the PayrollProcessing component
vi.mock('@/components/payroll/PayrollProcessing', () => ({
  PayrollProcessing: () => <div>PayrollProcessing Component</div>,
}));

// Mock the PayslipViewer component
vi.mock('@/components/payroll/PayslipViewer', () => ({
  PayslipViewer: () => <div>PayslipViewer Component</div>,
}));

describe('Payroll Page', () => {
  const mockPayrollStore = {
    records: [],
    payslips: [],
    loading: false,
    error: null,
    fetchRecords: vi.fn(),
    generatePayslip: vi.fn(),
    downloadPayslip: vi.fn(),
    processMonthlyPayroll: vi.fn(),
  };

  const mockAuthStore = {
    user: {
      id: 'user-001',
      email: 'user@example.com',
      role: UserRole.FINANCE,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(payrollStore.usePayrollStore).mockReturnValue(mockPayrollStore as any);
    vi.mocked(authStore.useAuthStore).mockReturnValue(mockAuthStore as any);
  });

  it('should render payroll page for authorized users', () => {
    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('Payroll Management')).toBeInTheDocument();
    expect(screen.getByText(/Process payroll, manage salary components/)).toBeInTheDocument();
  });

  it('should show access denied for unauthorized users', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: {
        id: 'user-001',
        email: 'user@example.com',
        role: UserRole.EMPLOYEE,
      },
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText(/You do not have permission to access the Payroll module/)
    ).toBeInTheDocument();
  });

  it('should fetch payroll records on mount', async () => {
    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockPayrollStore.fetchRecords).toHaveBeenCalled();
    });
  });

  it('should display tabs for overview, processing, and payslips', () => {
    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Processing/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Payslips/i })).toBeInTheDocument();
  });

  it('should display payroll history table', () => {
    const mockRecords = [
      {
        id: 'payroll-001',
        employee_id: 'emp-001',
        month: 1,
        year: 2024,
        gross_salary: 50000,
        net_salary: 45000,
        deductions: 5000,
        status: 'processed' as const,
      },
    ];

    vi.mocked(payrollStore.usePayrollStore).mockReturnValue({
      ...mockPayrollStore,
      records: mockRecords,
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('Payroll History')).toBeInTheDocument();
    expect(screen.getByText('emp-001')).toBeInTheDocument();
    expect(screen.getByText('₹50,000')).toBeInTheDocument();
  });

  it('should display statutory deductions information', () => {
    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('Statutory Deductions')).toBeInTheDocument();
    expect(screen.getByText('Provident Fund (PF)')).toBeInTheDocument();
    expect(screen.getByText('Employee State Insurance (ESI)')).toBeInTheDocument();
    expect(screen.getByText('Income Tax')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(payrollStore.usePayrollStore).mockReturnValue({
      ...mockPayrollStore,
      loading: true,
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading payroll records...')).toBeInTheDocument();
  });

  it('should display error message', () => {
    const errorMessage = 'Failed to fetch payroll records';
    vi.mocked(payrollStore.usePayrollStore).mockReturnValue({
      ...mockPayrollStore,
      error: errorMessage,
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display empty state when no records', () => {
    vi.mocked(payrollStore.usePayrollStore).mockReturnValue({
      ...mockPayrollStore,
      records: [],
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('No payroll records found')).toBeInTheDocument();
  });

  it('should display payslips in payslips tab', () => {
    const mockPayslips = [
      {
        id: 'payslip-001',
        payroll_id: 'payroll-001',
        employee_id: 'emp-001',
        employee_name: 'John Doe',
        month: 1,
        year: 2024,
        generated_at: '2024-01-15T10:00:00Z',
        gross_salary: 50000,
        net_salary: 45000,
        deductions: 5000,
      },
    ];

    vi.mocked(payrollStore.usePayrollStore).mockReturnValue({
      ...mockPayrollStore,
      payslips: mockPayslips,
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    const payslipsTab = screen.getByRole('tab', { name: /Payslips/i });
    payslipsTab.click();

    expect(screen.getByText('Generated Payslips')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should allow HR Manager to access payroll', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: {
        id: 'user-001',
        email: 'hr@example.com',
        role: UserRole.HR_MANAGER,
      },
    } as any);

    render(
      <BrowserRouter>
        <Payroll />
      </BrowserRouter>
    );

    expect(screen.getByText('Payroll Management')).toBeInTheDocument();
  });
});
