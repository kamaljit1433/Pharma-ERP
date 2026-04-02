import { useCallback } from 'react';

export interface Toast {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * Custom hook for displaying toast notifications
 * This is a simplified version - in production, you'd integrate with a toast library
 */
export function useToast() {
  const toast = useCallback((notification: Toast) => {
    // For now, just log to console
    // In production, this would integrate with a toast notification library
    console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);

    // You could also dispatch to a notification store here
    // Example: useNotificationStore.getState().addNotification(notification);
  }, []);

  return { toast };
}
