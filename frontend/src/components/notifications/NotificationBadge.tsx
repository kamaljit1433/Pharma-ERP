import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '../ui/badge';
import notificationService from '../../services/notificationService';

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick, className = '' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getNotifications(1, 0);
        setUnreadCount(response.pagination.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-foreground hover:bg-muted rounded-md transition-colors ${className}`}
      aria-label="Notifications"
      title="View notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && !loading && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground"
          variant="default"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </button>
  );
};
