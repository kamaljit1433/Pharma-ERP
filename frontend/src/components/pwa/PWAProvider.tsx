import React, { useEffect } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { UpdateNotification } from './UpdateNotification';
import { InstallPrompt } from './InstallPrompt';
import { registerServiceWorker } from '@/utils/pwaRegister';
import { initOfflineQueue, setupAutoSync } from '@/utils/offlineQueue';

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize PWA functionality
    const initPWA = async () => {
      try {
        // Initialize offline queue
        await initOfflineQueue();
        console.log('Offline queue initialized');

        // Register service worker
        await registerServiceWorker({
          onSuccess: (registration) => {
            console.log('Service Worker registered successfully', registration);
          },
          onError: (error) => {
            console.error('Service Worker registration failed:', error);
          },
          onUpdate: (registration) => {
            console.log('New service worker available', registration);
          },
        });

        // Setup auto-sync for offline queue
        const cleanup = setupAutoSync(
          async (endpoint, method, data) => {
            // This will be replaced with actual API client
            const response = await fetch(endpoint, {
              method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: data ? JSON.stringify(data) : undefined,
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
          },
          (result) => {
            // Log sync results
            if (result.success > 0) {
              console.log(`✓ Synced ${result.success} operation(s) successfully`);
            }
            if (result.failed > 0) {
              console.warn(`✗ Failed to sync ${result.failed} operation(s)`);
            }
          }
        );

        return cleanup;
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    };

    const cleanup = initPWA();

    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, []);

  return (
    <>
      {children}
      <OfflineIndicator />
      <UpdateNotification />
      <InstallPrompt />
    </>
  );
};
