import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserMenu } from '../UserMenu';
import { useAuthStore } from '@/store/authStore';

// Mock store
vi.mock('@/store/authStore');

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('UserMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  it('renders user menu button with user initials', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'john.doe@example.com',
        role: 'employee',
        mfaEnabled: false,
        isActive: true,
      },
      logout: vi.fn(),
    });

    render(<UserMenu />);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('displays user email in menu button', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'john.doe@example.com',
        role: 'employee',
        mfaEnabled: false,
        isActive: true,
      },
      logout: vi.fn(),
    });

    render(<UserMenu />);
    
    expect(screen.getByText('john.doe')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'john.doe@example.com',
        role: 'hr_manager',
        mfaEnabled: false,
        isActive: true,
      },
      logout: vi.fn(),
    });

    render(<UserMenu />);
    
    const menuButton = screen.getByLabelText(/user menu/i);
    fireEvent.click(menuButton);
    
    // Dropdown should be visible
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('displays formatted role in dropdown', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'admin@example.com',
        role: 'super_admin',
        mfaEnabled: false,
        isActive: true,
      },
      logout: vi.fn(),
    });

    render(<UserMenu />);
    
    const menuButton = screen.getByLabelText(/user menu/i);
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('navigates to profile when Profile is clicked', () => {
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

    render(<UserMenu />);
    
    const menuButton = screen.getByLabelText(/user menu/i);
    fireEvent.click(menuButton);
    
    const profileButton = screen.getByText('Profile');
    fireEvent.click(profileButton);
    
    expect(window.location.href).toBe('/profile');
  });

  it('navigates to settings when Settings is clicked', () => {
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

    render(<UserMenu />);
    
    const menuButton = screen.getByLabelText(/user menu/i);
    fireEvent.click(menuButton);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    expect(window.location.href).toBe('/settings');
  });

  it('calls logout and redirects when Logout is clicked', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    (useAuthStore as any).mockReturnValue({
      user: {
        id: '1',
        employeeId: 'EMP001',
        email: 'test@example.com',
        role: 'employee',
        mfaEnabled: false,
        isActive: true,
      },
      logout,
    });

    render(<UserMenu />);
    
    const menuButton = screen.getByLabelText(/user menu/i);
    fireEvent.click(menuButton);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
      expect(window.location.href).toBe('/login');
    });
  });

  it('does not render when user is null', () => {
    (useAuthStore as any).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    const { container } = render(<UserMenu />);
    
    expect(container.firstChild).toBeNull();
  });

  it('closes dropdown when clicking outside', async () => {
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

    render(<UserMenu />);
    
    const menuButton = screen.getByLabelText(/user menu/i);
    fireEvent.click(menuButton);
    
    // Dropdown is open
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });
});
