/**
 * PWA Service Worker Registration and Management
 */

export interface PWAConfig {
  swPath?: string;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

let swRegistration: ServiceWorkerRegistration | null = null;
let updateIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Register service worker for PWA functionality
 */
export async function registerServiceWorker(config: PWAConfig = {}): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  // In dev mode Vite hasn't built sw.js — skip registration.
  // Also unregister any SW that was previously registered (e.g. from a production
  // build or the old /service-worker.js path) so it doesn't intercept Vite's HMR
  // WebSocket or CSS module requests and cause network errors.
  if (import.meta.env.DEV) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
    }
    return null;
  }

  try {
    // Default to the VitePWA-generated workbox SW so there is only one active SW
    const swPath = config.swPath || '/sw.js';
    swRegistration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
    });

    console.log('Service Worker registered:', swRegistration);

    // Check for updates periodically — guard against duplicate registrations
    if (updateIntervalId === null) {
      updateIntervalId = setInterval(() => {
        swRegistration?.update();
      }, 60000);
    }

    // Listen for updates
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            config.onUpdate?.(swRegistration!);
          }
        });
      }
    });

    config.onSuccess?.(swRegistration);
    return swRegistration;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Service Worker registration failed:', err);
    config.onError?.(err);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!swRegistration) {
    return false;
  }

  try {
    const success = await swRegistration.unregister();
    if (success) {
      swRegistration = null;
    }
    return success;
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}

/**
 * Check if app is installable
 */
export function isInstallable(): boolean {
  return 'beforeinstallprompt' in window;
}

/**
 * Request PWA installation
 */
export async function requestInstall(): Promise<boolean> {
  const event = (window as any).deferredPrompt;
  if (!event) {
    console.warn('Installation prompt not available');
    return false;
  }

  try {
    event.prompt();
    const { outcome } = await event.userChoice;
    (window as any).deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('Installation failed:', error);
    return false;
  }
}

/**
 * Check if app is running in standalone mode (installed)
 */
export function isStandalone(): boolean {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Get service worker registration
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

/**
 * Send message to service worker
 */
export function postMessageToSW(message: any): void {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/**
 * Listen for messages from service worker
 */
export function onServiceWorkerMessage(callback: (event: ExtendableMessageEvent) => void): void {
  navigator.serviceWorker.addEventListener('message', callback);
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return 'denied';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push Notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await (registration as any).pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check online status.
 * navigator.onLine alone is unreliable (returns true even on captive portals),
 * so this is a best-effort synchronous check. Prefer the online/offline events
 * (onOnlineStatusChange) for reactive updates.
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
