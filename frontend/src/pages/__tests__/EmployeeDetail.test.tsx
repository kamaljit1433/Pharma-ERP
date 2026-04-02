import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDetail from '../EmployeeDetail';
import { useEmployeeStore } from '@/store/employeeStore';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/auth';

// Mock the stores
vi.mock('@/store/employeeStore');
vi.mock('@/store/authStore');
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the components
vi.mock('@/components/employee/EmployeeDetails', () => ({
  EmployeeDetails: () => <div>Employee Details</div>,
}));

vi.mock('@/components/employee/EmergencyContactForm', () => ({
  EmergencyContactForm: () => <div>Emergency Contacts</div>,
}));

vi.mock('@/components/employee/EmployeeForm', () => ({
  EmployeeForm: ({ onCancel }: any) => (
    <div>
      <button onClick={onCancel}>Cancel</button>
      Employee Form
    </div>
  ),
}));

vi.mock('@/components/employee/EmployeeAttendanceTab', () => ({
  EmployeeAttendanceTab: () => <div>Attendance Tab</div>,
}));

vi.mock('@/components/employee/EmployeeLeaveTab', () => ({
  EmployeeLeaveTab: () => <div>Leave Tab</div>,
}));

vi.mock('@/components/employee/EmployeePayrollTab', () => ({
  EmployeePayrollTab: () => <div>Payroll Tab</div>,
}));

vi.mock('@/components/employee/EmployeeDocumentsTab', () => ({
  EmployeeDocumentsTab: () => <div>Documents Tab</div>,
}));

vi.mock('@/components/employee/EmployeeHistoryTab', () => ({
  EmployeeHistoryTab: () => <div>History Tab</div>,
}));

describe('EmployeeDetail Page', () => {
  const mockEmployee = {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    date_of_birth: '1990-01-01',
    gender: 'male',
    department_id: 'dept1',
    designation_id: 'des1',
    date_of_joining: '2020-01-01',
    employment_type: 'permanent' as const,
    status: 'active' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when employee is loading', () => {
    (useEmployeeStore as any).mockReturnValue({
      currentItem: null,
      loading: true,
      fetchItem: vi.fn(),
      updateItem: vi.fn(),
    });

    (useAuthStore as any).mockReturnValue({
      user: { role: UserRole.HR_MANAGER },
    });

    render(
      <BrowserRouter>
        <EmployeeDetail />
      </BrowserRouter>
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should render employee not found when employee is null', () => {
    (useEmployeeStore as any).mockReturnValue({
      currentItem: null,
      loading: false,
      fetchItem: vi.fn(),
      updateItem: vi.fn(),
    });

    (useAuthStore as any).mockReturnValue({
      user: { role: UserRole.HR_MANAGER },
    });

    render(
      <BrowserRouter>
        <EmployeeDetail />
      </BrowserRouter>
    );

    expect(screen.getByText('Employee not found')).toBeInTheDocument();
  });

  it('should render employee details in view mode', async () => {
    (useEmployeeStore as any).mockReturnValue({
      currentItem: mockEmployee,
      loading: false,
      fetchItem: vi.fn(),
      updateItem: vi.fn(),
    });

    (useAuthStore as any).mockReturnValue({
      user: { role: UserRole.HR_MANAGER },
    });

    render(
      <BrowserRouter>
        <EmployeeDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Employee Details')).toBeInTheDocument();
    });

    // Check tabs are rendered
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Related Records')).toBeInTheDocument();
  });

  it('should show edit button for HR Manager', () => {
    (useEmployeeStore as any).mockReturnValue({
      currentItem: mockEmployee,
      loading: false,
      fetchItem: vi.fn(),
      updateItem: vi.fn(),
    });

    (useAuthStore as any).mockReturnValue({
      user: { role: UserRole.HR_MANAGER },
    });

    render(
      <BrowserRouter>
        <EmployeeDetail />
      </BrowserRouter>
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should not show edit button for Employee role', () => {
    (useEmployeeStore as any).mockReturnValue({
      currentItem: mockEmployee,
      loading: false,
      fetchItem: vi.fn(),
      updateItem: vi.fn(),
    });

    (useAuthStore as any).mockReturnValue({
      user: { role: UserRole.EMPLOYEE },
    });

    render(
      <BrowserRouter>
        <EmployeeDetail />
      </BrowserRouter>
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});
