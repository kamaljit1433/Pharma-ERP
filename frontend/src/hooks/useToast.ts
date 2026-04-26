import { useCallback } from 'react';

export interface Toast {
  type?: 'success' | 'error' | 'info' | 'warning';
  message?: string;
  duration?: number;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Custom hook for displaying toast notifications
 * This is a simplified version - in production, you'd integrate with a toast library
 */
export function useToast() {
  const toast = useCallback((notification: Toast) => {
    // For now, just log to console
    // Safely extract properties handling both { type, message } and { variant, title, description }
    const notifType = notification.type || notification.variant || 'info';
    const msg = notification.message || notification.description || notification.title || '';
    
    console.log(`[${notifType.toUpperCase()}] ${msg}`);
  }, []);

  return { toast };
}
