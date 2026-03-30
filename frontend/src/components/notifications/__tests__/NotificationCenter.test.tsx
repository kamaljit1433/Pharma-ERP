import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';
import notificationService from '../../../services/notificationService';

jest.mock('../../../services/notificationService');

const mockNotifications = [
  {
    id: '1',
    employee_id: 'emp1',
    title: 'Leave Approved',
    message: 'Your leave request has been approved',
    type: 'success' as const,
    channel: 'in_app' as const,
    is_read: false,
    created_at: new Date(),
  },
  {
    id: '2',
    employee_id: 'emp1',
    title: 'Payroll Processed',
    message: 'Your payslip is ready',
    type: 'info' as const,
    channel: 'in_app' as const,
    is_read: true,
    created_at: new Date(),
  },
];

describe('NotificationCenter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notification center', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: mockNotifications,
      pagination: { limit: 50, offset: 0, unreadCount: 1 },
    });

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('should display unread count', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: mockNotifications,
      pagination: { limit: 50, offset: 0, unreadCount: 1 },
    });

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText(/1 unread notification/)).toBeInTheDocument();
    });
  });

  it('should display notifications list', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: mockNotifications,
      pagination: { limit: 50, offset: 0, unreadCount: 1 },
    });

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('Leave Approved')).toBeInTheDocument();
      expect(screen.getByText('Payroll Processed')).toBeInTheDocument();
    });
  });

  it('should mark notification as read', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: mockNotifications,
      pagination: { limit: 50, offset: 0, unreadCount: 1 },
    });
    (notificationService.markAsRead as jest.Mock).mockResolvedValue({
      ...mockNotifications[0],
      is_read: true,
    });

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('Leave Approved')).toBeInTheDocument();
    });

    const notification = screen.getByText('Leave Approved').closest('div');
    fireEvent.click(notification!);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('should display empty state when no notifications', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, unreadCount: 0 },
    });

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (notificationService.getNotifications as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
    });
  });

  it('should mark all as read', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: mockNotifications,
      pagination: { limit: 50, offset: 0, unreadCount: 1 },
    });
    (notificationService.markMultipleAsRead as jest.Mock).mockResolvedValue(undefined);

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });

    const markAllButton = screen.getByText('Mark all as read');
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(notificationService.markMultipleAsRead).toHaveBeenCalled();
    });
  });

  it('should load more notifications', async () => {
    (notificationService.getNotifications as jest.Mock)
      .mockResolvedValueOnce({
        data: mockNotifications,
        pagination: { limit: 50, offset: 0, unreadCount: 1 },
      })
      .mockResolvedValueOnce({
        data: [mockNotifications[0]],
        pagination: { limit: 50, offset: 50, unreadCount: 0 },
      });

    render(<NotificationCenter />);
    await waitFor(() => {
      expect(screen.getByText('Load more')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByText('Load more');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalledWith(50, 50);
    });
  });
});
