import { useEffect, useRef, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, VAPID_KEY, isFirebaseConfigured } from '@/config/firebase';
import notificationService from '@/services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';

export function useFCM() {
  const currentToken = useRef<string | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const registerToken = useCallback(async (token: string) => {
    if (currentToken.current === token) return;
    currentToken.current = token;
    try {
      await notificationService.registerDeviceToken(token, 'web');
      console.log('[FCM] Device token registered');
    } catch (err) {
      console.error('[FCM] Failed to register device token:', err);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const initFCM = async () => {
      try {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }
        if (Notification.permission !== 'granted') return;
        if (cancelled) return;

        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        // Register firebase-messaging-sw.js explicitly so FCM works in both
        // dev and production (VitePWA unregisters service workers in dev mode)
        let swReg: ServiceWorkerRegistration;
        try {
          swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
          await swReg.update();
        } catch {
          swReg = await navigator.serviceWorker.ready;
        }
        if (cancelled) return;

        const vapidKey = VAPID_KEY;
        if (!vapidKey || vapidKey.includes('your_')) {
          console.warn('[FCM] VITE_FIREBASE_VAPID_KEY is not configured');
          return;
        }

        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
        if (cancelled) return;

        if (token) {
          await registerToken(token);
        } else {
          console.warn('[FCM] No token received — check VAPID key and service worker');
        }

        unsubscribe = onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (!title) return;

          addNotification({
            id: crypto.randomUUID(),
            employee_id: '',
            title,
            message: body || '',
            type: 'info',
            channel: 'push',
            is_read: false,
            read_at: null,
            metadata: payload.data || null,
            created_at: new Date(),
          });

          if (document.visibilityState === 'visible') {
            new Notification(title, {
              body: body || '',
              icon: '/pwa-192x192.png',
              badge: '/pwa-64x64.png',
            });
          }
        });
      } catch (err) {
        console.error('[FCM] Initialization error:', err);
      }
    };

    initFCM();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [addNotification, registerToken]);
}
