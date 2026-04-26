import React from 'react';
import { CheckCheck, X } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

/**
 * NotificationDropdown Component
 * 
 * Dropdown panel displaying notification list with:
 * - Notification title, message, and timestamp
 * - Mark as read functionality
 * - Mark all as read action
 * - View all notifications link
 * 
 * Requirements: 16.3, 16.4, 16.5, 16.6
 */
export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div 
      className="absolute right-0 top-12 z-50 w-80 rounded-md border bg-card shadow-lg sm:w-96"
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold" id="notifications-title">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
              aria-label={`Mark all ${unreadCount} notifications as read`}
            >
              <CheckCheck className="mr-1 h-3 w-3" aria-hidden="true" />
              Mark all read
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-8 w-8"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Notification list */}
      <div 
        className="max-h-96 overflow-y-auto"
        role="list"
        aria-label="Notification list"
      >
        {notifications.length === 0 ? (
          <div 
            className="p-8 text-center text-sm text-muted-foreground"
            role="status"
          >
            No notifications
          </div>
        ) : (
          notifications.slice(0, 10).map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Separator />}
              <div
                className={cn(
                  'cursor-pointer p-4 transition-colors hover:bg-accent',
                  !notification.is_read && 'bg-accent/50'
                )}
                onClick={(e) => handleMarkAsRead(notification.id, e)}
                role="listitem"
                aria-label={`${notification.title}, ${notification.is_read ? 'read' : 'unread'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMarkAsRead(notification.id, e as any);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent',
                      getNotificationColor(notification.type)
                    )}
                    aria-hidden="true"
                  >
                    <span className="text-sm font-bold">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div 
                          className="h-2 w-2 flex-shrink-0 rounded-full bg-primary"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={notification.created_at}>
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </time>
                    </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                onClose();
                // Navigate to notifications page (will be implemented in routing)
                window.location.href = '/notifications';
              }}
              aria-label="View all notifications"
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
