import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

const SESSION_REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute

/**
 * Hook to manage user session
 * - Automatically refreshes session every 25 minutes
 * - Checks for session expiry every minute
 * - Redirects to login if session expires
 */
export const useSessionManagement = () => {
  const { isAuthenticated, sessionExpiresAt, refreshSession, logout } = useAuthStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear intervals if not authenticated
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Set up automatic session refresh
    refreshIntervalRef.current = setInterval(() => {
      console.log('Refreshing session...');
      refreshSession();
    }, SESSION_REFRESH_INTERVAL);

    // Set up session expiry check
    checkIntervalRef.current = setInterval(() => {
      if (sessionExpiresAt && Date.now() >= sessionExpiresAt) {
        console.log('Session expired, logging out...');
        logout();
      }
    }, SESSION_CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, sessionExpiresAt, refreshSession, logout]);

  return {
    isAuthenticated,
    sessionExpiresAt,
  };
};
