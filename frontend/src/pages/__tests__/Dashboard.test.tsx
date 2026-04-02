import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';

// Mock the auth store
vi.mock('../../store/authStore');

// Mock the dashboard components
vi.mock('../../components/dashboard/AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

vi.mock('../../components/dashboard/HRManagerDashboard', () => ({
  default: () => <div data-testid="hr-dashboard">HR Manager Dashboard</div>,
}));

vi.mock('../../components/dashboard/DepartmentManagerDashboard', () => ({
  default: () => <div data-testid="dept-dashboard">Department Manager Dashboard</div>,
}));

vi.mock('../../components/dashboard/EmployeeDashboard', () => ({
  default: () => <div data-testid="employee-dashboard">Employee Dashboard</div>,
}));

describe('Dashboard - Role-Based Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Super Admin Role', () => {
    it('should render AdminDashboard for Super Admin', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '1',
          employeeId: 'EMP001',
          email: 'admin@test.com',
          role: UserRole.SUPER_ADMIN,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });

    it('should render admin dashboard with correct role context', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '1',
          employeeId: 'EMP001',
          email: 'admin@test.com',
          role: UserRole.SUPER_ADMIN,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      const { container } = render(<Dashboard />);
      expect(container.querySelector('[data-testid="admin-dashboard"]')).toBeInTheDocument();
    });
  });

  describe('IT Admin Role', () => {
    it('should render AdminDashboard for IT Admin', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '2',
          employeeId: 'EMP002',
          email: 'it@test.com',
          role: UserRole.IT_ADMIN,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });
  });

  describe('HR Manager Role', () => {
    it('should render HRManagerDashboard for HR Manager', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '3',
          employeeId: 'EMP003',
          email: 'hr@test.com',
          role: UserRole.HR_MANAGER,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.getByTestId('hr-dashboard')).toBeInTheDocument();
    });
  });

  describe('Finance Role', () => {
    it('should render HRManagerDashboard for Finance role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '4',
          employeeId: 'EMP004',
          email: 'finance@test.com',
          role: UserRole.FINANCE,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.getByTestId('hr-dashboard')).toBeInTheDocument();
    });
  });

  describe('Department Manager Role', () => {
    it('should render DepartmentManagerDashboard for Department Manager', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '5',
          employeeId: 'EMP005',
          email: 'manager@test.com',
          role: UserRole.DEPARTMENT_MANAGER,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.getByTestId('dept-dashboard')).toBeInTheDocument();
    });
  });

  describe('Employee Role', () => {
    it('should render EmployeeDashboard for Employee role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '6',
          employeeId: 'EMP006',
          email: 'employee@test.com',
          role: UserRole.EMPLOYEE,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.getByTestId('employee-dashboard')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should render nothing when user is null', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      const { container } = render(<Dashboard />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render any dashboard when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hr-dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dept-dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('employee-dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Role Isolation', () => {
    it('should not render admin dashboard for non-admin roles', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '7',
          employeeId: 'EMP007',
          email: 'employee@test.com',
          role: UserRole.EMPLOYEE,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    });

    it('should not render employee dashboard for admin roles', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: {
          id: '8',
          employeeId: 'EMP008',
          email: 'admin@test.com',
          role: UserRole.SUPER_ADMIN,
          mfaEnabled: false,
          isActive: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        clearError: vi.fn(),
        setLoading: vi.fn(),
      });

      render(<Dashboard />);
      expect(screen.queryByTestId('employee-dashboard')).not.toBeInTheDocument();
    });
  });
});
