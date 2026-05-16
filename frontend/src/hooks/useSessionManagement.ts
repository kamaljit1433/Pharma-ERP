import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

const SESSION_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 min — well before 15-min JWT expiry
const SESSION_CHECK_INTERVAL = 60 * 1000;         // 1 min
const MAX_REFRESH_RETRIES = 3;
const RETRY_BACKOFF_MS = 5000;

export const IDLE_TIMEOUT_KEY = 'session-idle-timeout-minutes';
export const LAST_ACTIVITY_KEY = 'session-last-activity';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

function recordActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

function getIdleTimeoutMs(): number {
  const raw = localStorage.getItem(IDLE_TIMEOUT_KEY);
  const minutes = raw !== null ? parseInt(raw, 10) : 60;
  return minutes > 0 ? minutes * 60 * 1000 : 0; // 0 means never
}

export const useSessionManagement = () => {
  const { isAuthenticated, sessionExpiresAt, refreshSession, logout } = useAuthStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshRetryCountRef = useRef(0);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      refreshIntervalRef.current = null;
      checkIntervalRef.current = null;
      refreshRetryCountRef.current = 0;
      isRefreshingRef.current = false;
      return;
    }

    // Track activity
    recordActivity();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, recordActivity, { passive: true }));

    const performRefresh = async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      try {
        await refreshSession();
        refreshRetryCountRef.current = 0;
      } catch (error) {
        refreshRetryCountRef.current++;
        if (refreshRetryCountRef.current >= MAX_REFRESH_RETRIES) {
          logout();
          refreshRetryCountRef.current = 0;
        } else {
          const delay = RETRY_BACKOFF_MS * refreshRetryCountRef.current;
          setTimeout(() => {
            isRefreshingRef.current = false;
            performRefresh();
          }, delay);
        }
      } finally {
        isRefreshingRef.current = false;
      }
    };

    refreshIntervalRef.current = setInterval(performRefresh, SESSION_REFRESH_INTERVAL);

    checkIntervalRef.current = setInterval(() => {
      // Hard session expiry
      if (sessionExpiresAt && Date.now() >= sessionExpiresAt) {
        logout();
        return;
      }

      // Inactivity timeout
      const idleMs = getIdleTimeoutMs();
      if (idleMs > 0) {
        const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
        if (lastActivity && Date.now() - lastActivity >= idleMs) {
          logout();
        }
      }
    }, SESSION_CHECK_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, recordActivity));
    };
  }, [isAuthenticated, sessionExpiresAt, refreshSession, logout]);

  return { isAuthenticated, sessionExpiresAt };
};
