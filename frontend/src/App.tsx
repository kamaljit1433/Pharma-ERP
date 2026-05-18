import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { registerServiceWorker, isStandalone } from '@/utils/pwaRegister';
import { initializeOfflineStorage } from '@/utils/offlineStorage';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useThemeInitialization } from '@/hooks/useThemeInitialization';
import { OfflineIndicator, UpdateNotification } from '@/components/pwa';

const App: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  
  // Initialize auth on app startup (validate persisted tokens)
  useAuthInitialization();
  
  // Initialize session management
  useSessionManagement();
  
  // Initialize theme system
  // Requirement 24.5: Detect system theme preference on first load
  // Requirement 24.2: Use CSS variables for theme colors
  // Requirement 24.3: Apply theme consistently across all components
  useThemeInitialization(true);

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

        // Check if app is installed
        setIsInstalled(isStandalone());
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    };

    initPWA();
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <OfflineIndicator />
      <UpdateNotification />
      <Outlet />
    </div>
  );
};

export default App;
