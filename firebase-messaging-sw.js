importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:'AIzaSyAmPtmyZ4FuyoXjojHsCcmVP2Amj--YgDY',authDomain:'hervago.firebaseapp.com',projectId:'hervago',storageBucket:'hervago.firebasestorage.app',messagingSenderId:'451176229718',appId:'1:451176229718:web:e3c81a9edfae78946f44f7'});
const messaging=firebase.messaging();
messaging.onBackgroundMessage((payload)=>{
  const title=payload.notification?.title || 'Hervago';
  const options={body:payload.notification?.body || payload.data?.body || 'Nueva alerta',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',data:{url:payload.data?.url || './index-hervago-pwa.html'}};
  self.registration.showNotification(title,options);
});
self.addEventListener('notificationclick',(event)=>{event.notification.close();event.waitUntil(clients.openWindow(event.notification.data?.url || './index-hervago-pwa.html'));});
