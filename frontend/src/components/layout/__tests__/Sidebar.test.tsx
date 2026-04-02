import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { UserRole } from '@/types/auth';

// Mock the stores
vi.mock('@/store/authStore');
vi.mock('@/store/uiStore');

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Users: () => <div data-testid="icon-users" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  CalendarDays: () => <div data-testid="icon-calendar-days" />,
  DollarSign: () => <div data-testid="icon-dollar" />,
  UserPlus: () => <div data-testid="icon-user-plus" />,
  TrendingUp: () => <div data-testid="icon-trending" />,
  GraduationCap: () => <div data-testid="icon-graduation" />,
  Gift: () => <div data-testid="icon-gift" />,
  UserMinus: () => <div data-testid="icon-user-minus" />,
  Network: () => <div data-testid="icon-network" />,
  Settings: () => <div data-testid="icon-settings" />,
}));

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when user is not authenticated', () => {
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

    vi.mocked(useUIStore).mockReturnValue({
      theme: 'light',
      sidebarOpen: true,
      modals: {},
      toasts: [],
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
    });

    const { container } = renderSidebar();
    expect(container.firstChild).toBeNull();
  });

  it('should render user profile summary when authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        mfaEnabled: false,
        isActive: true,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionExpiresAt: Date.now() + 30 * 60 * 1000,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
    });

    vi.mocked(useUIStore).mockReturnValue({
      theme: 'light',
      sidebarOpen: true,
      modals: {},
      toasts: [],
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
    });

    renderSidebar();

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('employee')).toBeInTheDocument();
  });

  it('should render navigation links for employee role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        mfaEnabled: false,
        isActive: true,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionExpiresAt: Date.now() + 30 * 60 * 1000,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
    });

    vi.mocked(useUIStore).mockReturnValue({
      theme: 'light',
      sidebarOpen: true,
      modals: {},
      toasts: [],
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
    });

    renderSidebar();

    // Employee should see Dashboard, Attendance, Leave, Performance, Training, Benefits, Organization, Settings
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Leave')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Benefits')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render more navigation links for HR Manager role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'hr@example.com',
        role: UserRole.HR_MANAGER,
        mfaEnabled: false,
        isActive: true,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionExpiresAt: Date.now() + 30 * 60 * 1000,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
    });

    vi.mocked(useUIStore).mockReturnValue({
      theme: 'light',
      sidebarOpen: true,
      modals: {},
      toasts: [],
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
    });

    renderSidebar();

    // HR Manager should see additional modules
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getByText('Recruitment')).toBeInTheDocument();
    expect(screen.getByText('Separation')).toBeInTheDocument();
  });

  it('should show collapse button when sidebar is open', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        mfaEnabled: false,
        isActive: true,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionExpiresAt: Date.now() + 30 * 60 * 1000,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
    });

    vi.mocked(useUIStore).mockReturnValue({
      theme: 'light',
      sidebarOpen: true,
      modals: {},
      toasts: [],
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
    });

    renderSidebar();

    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('should hide labels when sidebar is collapsed', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'test@example.com',
        role: UserRole.EMPLOYEE,
        mfaEnabled: false,
        isActive: true,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionExpiresAt: Date.now() + 30 * 60 * 1000,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
    });

    vi.mocked(useUIStore).mockReturnValue({
      theme: 'light',
      sidebarOpen: false,
      modals: {},
      toasts: [],
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
    });

    renderSidebar();

    // Labels should not be visible when collapsed
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
  });
});
