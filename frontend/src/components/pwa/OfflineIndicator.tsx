import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { onOnlineStatusChange } from '@/utils/pwaRegister';

// Confirm we're actually offline by attempting a small network request.
// navigator.onLine and the 'offline' event can fire false positives when
// switching networks, VPN changes, or Windows briefly drops the adapter.
async function confirmOffline(): Promise<boolean> {
  try {
    await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-store',
      // Short timeout — if we're online this should complete in <1 s
      signal: AbortSignal.timeout(3000),
    });
    return false; // fetch succeeded → we are online
  } catch {
    return true; // fetch failed → genuinely offline
  }
}

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = onOnlineStatusChange(async (online) => {
      if (!online) {
        // Don't trust the 'offline' event alone — verify with a real request
        const actuallyOffline = await confirmOffline();
        if (!actuallyOffline) return; // false positive, stay silent
      }

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setIsOnline(online);
      setShowIndicator(true);

      if (online) {
        // Auto-hide the "back online" badge after 3 seconds
        hideTimerRef.current = setTimeout(() => setShowIndicator(false), 3000);
      }
    });

    return () => {
      unsubscribe();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: isOnline ? '#d1fae5' : '#fee2e2',
        border: `1px solid ${isOnline ? '#a7f3d0' : '#fecaca'}`,
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        color: isOnline ? '#065f46' : '#7f1d1d',
        zIndex: 9997,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>You are offline</span>
        </>
      )}
    </div>
  );
};
