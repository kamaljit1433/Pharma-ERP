import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { onOnlineStatusChange } from '@/utils/pwaRegister';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const unsubscribe = onOnlineStatusChange((online) => {
      setIsOnline(online);
      if (!online) {
        setShowIndicator(true);
      } else {
        // Show online indicator briefly
        setShowIndicator(true);
        const timer = setTimeout(() => setShowIndicator(false), 3000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      unsubscribe();
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
        animation: 'slideIn 0.3s ease-out',
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
