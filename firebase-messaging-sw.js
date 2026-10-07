importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAmPtmyZ4FuyoXjojHsCcmVP2Amj--YgDY',
  authDomain: 'hervago.firebaseapp.com',
  projectId: 'hervago',
  storageBucket: 'hervago.firebasestorage.app',
  messagingSenderId: '451176229718',
  appId: '1:451176229718:web:e3c81a9edfae78946f44f7'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);
  const title = payload.notification?.title || payload.data?.title || 'Hervago';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'Nueva alerta de Hervago',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
