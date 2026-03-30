import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { registerServiceWorker, onOnlineStatusChange, isStandalone } from '@/utils/pwaRegister';
import { initializeOfflineStorage } from '@/utils/offlineStorage';

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Initialize PWA
    const initPWA = async () => {
      try {
        // Register service worker
        await registerServiceWorker({
          onSuccess: (registration) => {
            console.log('PWA Service Worker registered successfully');
          },
          onError: (error) => {
            console.error('PWA Service Worker registration failed:', error);
          },
          onUpdate: (registration) => {
            console.log('PWA update available');
            // Notify user about update
            window.dispatchEvent(
              new CustomEvent('pwa-update-available', {
                detail: { registration },
              })
            );
          },
        });

        // Initialize offline storage
        await initializeOfflineStorage();
        console.log('Offline storage initialized');

        // Check if app is installed
        setIsInstalled(isStandalone());
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    };

    initPWA();

    // Listen for online/offline status changes
    const unsubscribe = onOnlineStatusChange((online) => {
      setIsOnline(online);
      if (online) {
        // Trigger sync when coming back online
        window.dispatchEvent(new CustomEvent('app-online'));
      } else {
        window.dispatchEvent(new CustomEvent('app-offline'));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0a0a0a' }}>
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fca5a5',
            color: '#7f1d1d',
            padding: '12px 16px',
            textAlign: 'center',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          You are offline. Some features may be limited.
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default App;
