import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBadge } from '../NotificationBadge';
import notificationService from '../../../services/notificationService';

jest.mock('../../../services/notificationService');

describe('NotificationBadge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notification bell icon', () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, unreadCount: 0 },
    });

    render(<NotificationBadge />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('should display unread count badge', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, unreadCount: 5 },
    });

    render(<NotificationBadge />);
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should display 99+ for high unread counts', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, unreadCount: 150 },
    });

    render(<NotificationBadge />);
    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  it('should not display badge when unread count is 0', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, unreadCount: 0 },
    });

    render(<NotificationBadge />);
    await waitFor(() => {
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
  });

  it('should call onClick handler when clicked', async () => {
    const onClick = jest.fn();
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, unreadCount: 0 },
    });

    render(<NotificationBadge onClick={onClick} />);
    const button = screen.getByLabelText('Notifications');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    (notificationService.getNotifications as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(<NotificationBadge />);
    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });
  });
});
