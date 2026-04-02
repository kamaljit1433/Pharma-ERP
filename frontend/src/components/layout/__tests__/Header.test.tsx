import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

// Mock stores
vi.mock('@/store/uiStore');
vi.mock('@/store/authStore');
vi.mock('@/store/notificationStore');

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock uiStore
    (useUIStore as any).mockReturnValue({
      toggleSidebar: vi.fn(),
      sidebarOpen: false,
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    // Mock authStore
    (useAuthStore as any).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'test@example.com',
        role: 'employee',
        mfaEnabled: false,
        isActive: true,
      },
      logout: vi.fn(),
    });

    // Mock notificationStore
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });
  });

  it('renders header with logo and app title', () => {
    render(<Header />);
    
    expect(screen.getByText('EMS')).toBeInTheDocument();
    expect(screen.getByText('Employee Management')).toBeInTheDocument();
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Header />);
    
    const menuButton = screen.getByLabelText(/open menu/i);
    expect(menuButton).toBeInTheDocument();
  });

  it('toggles sidebar when hamburger menu is clicked', () => {
    const toggleSidebar = vi.fn();
    (useUIStore as any).mockReturnValue({
      toggleSidebar,
      sidebarOpen: false,
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    render(<Header />);
    
    const menuButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(menuButton);
    
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('renders notification bell', () => {
    render(<Header />);
    
    const notificationButton = screen.getByLabelText(/notifications/i);
    expect(notificationButton).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Header />);
    
    const themeButton = screen.getByLabelText(/switch to/i);
    expect(themeButton).toBeInTheDocument();
  });

  it('renders user menu', () => {
    render(<Header />);
    
    const userMenuButton = screen.getByLabelText(/user menu/i);
    expect(userMenuButton).toBeInTheDocument();
  });

  it('shows search toggle button on mobile', () => {
    render(<Header />);
    
    const searchToggle = screen.getByLabelText(/toggle search/i);
    expect(searchToggle).toBeInTheDocument();
  });

  it('displays mobile search bar when search toggle is clicked', () => {
    render(<Header />);
    
    const searchToggle = screen.getByLabelText(/toggle search/i);
    fireEvent.click(searchToggle);
    
    // Mobile search bar should be visible
    const searchInputs = screen.getAllByPlaceholderText(/search/i);
    expect(searchInputs.length).toBeGreaterThan(0);
  });
});
