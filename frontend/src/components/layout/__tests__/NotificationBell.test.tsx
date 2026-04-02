import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import { useNotificationStore } from '@/store/notificationStore';

// Mock store
vi.mock('@/store/notificationStore');

describe('NotificationBell Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification bell icon', () => {
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    const bellButton = screen.getByLabelText(/notifications/i);
    expect(bellButton).toBeInTheDocument();
  });

  it('displays unread count badge when there are unread notifications', () => {
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 5,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays 99+ when unread count exceeds 99', () => {
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 150,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not display badge when unread count is 0', () => {
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
  });

  it('fetches notifications on mount', () => {
    const fetchNotifications = vi.fn();
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('opens dropdown when bell is clicked', () => {
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    const bellButton = screen.getByLabelText(/notifications/i);
    fireEvent.click(bellButton);
    
    // Dropdown should be visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    
    const bellButton = screen.getByLabelText(/notifications/i);
    fireEvent.click(bellButton);
    
    // Dropdown is open
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });
});
