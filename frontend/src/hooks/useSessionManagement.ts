import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

const SESSION_REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute
const MAX_REFRESH_RETRIES = 3;
const RETRY_BACKOFF_MS = 5000; // 5 seconds

/**
 * Hook to manage user session
 * - Automatically refreshes session every 25 minutes
 * - Checks for session expiry every minute
 * - Implements retry logic for failed refreshes
 * - Redirects to login if session expires
 */
export const useSessionManagement = () => {
  const { isAuthenticated, sessionExpiresAt, refreshSession, logout } = useAuthStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshRetryCountRef = useRef(0);
  const isRefreshingRef = useRef(false);

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
      refreshRetryCountRef.current = 0;
      isRefreshingRef.current = false;
      return;
    }

    // Perform session refresh with retry logic
    const performRefresh = async () => {
      // Prevent concurrent refresh attempts
      if (isRefreshingRef.current) {
        console.log('Refresh already in progress, skipping...');
        return;
      }

      isRefreshingRef.current = true;
      try {
        console.log('Refreshing session...');
        await refreshSession();
        refreshRetryCountRef.current = 0; // Reset retry count on success
      } catch (error) {
        console.error('Session refresh failed:', error);
        refreshRetryCountRef.current++;

        // If max retries exceeded, logout
        if (refreshRetryCountRef.current >= MAX_REFRESH_RETRIES) {
          console.log('Max refresh retries exceeded, logging out...');
          logout();
          refreshRetryCountRef.current = 0;
        } else {
          // Schedule retry with exponential backoff
          const retryDelay = RETRY_BACKOFF_MS * refreshRetryCountRef.current;
          console.log(`Scheduling refresh retry in ${retryDelay}ms (attempt ${refreshRetryCountRef.current}/${MAX_REFRESH_RETRIES})`);
          setTimeout(() => {
            isRefreshingRef.current = false;
            performRefresh();
          }, retryDelay);
        }
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Set up automatic session refresh
    refreshIntervalRef.current = setInterval(() => {
      performRefresh();
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
