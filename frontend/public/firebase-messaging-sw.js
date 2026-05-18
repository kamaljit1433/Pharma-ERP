importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyDRNrUSGZrB2Wzv4ECMXaZvtFL6uSPAbHw',
  authDomain: 'pharma-erp-9da11.firebaseapp.com',
  projectId: 'pharma-erp-9da11',
  storageBucket: 'pharma-erp-9da11.firebasestorage.app',
  messagingSenderId: '94018580441',
  appId: '1:94018580441:web:4653d405c1d4e02f5373c8',
};

if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // Handle background push messages
  messaging.onBackgroundMessage((payload) => {
    const { title, body, icon, image } = payload.notification || {};
    const notificationTitle = title || 'New Notification';
    const notificationOptions = {
      body: body || '',
      icon: icon || '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      image,
      data: payload.data,
      tag: payload.data?.type || 'notification',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Open or focus the app when a notification is clicked
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.link || '/notifications';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        const existingWindow = windowClients.find(
          (client) => new URL(client.url).origin === self.location.origin
        );
        if (existingWindow) {
          existingWindow.focus();
          existingWindow.navigate(url);
        } else {
          clients.openWindow(url);
        }
      })
    );
  });
}
