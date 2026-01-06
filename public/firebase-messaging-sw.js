// This service worker file is required to handle background push notifications.
// It must be placed in the public directory.

// Import the Firebase app and messaging services
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlbeO-lWkgVHAckFfNuFr6h8vjFZUMG70",
  authDomain: "login-and-sign-up-e39e4.firebaseapp.com",
  projectId: "login-and-sign-up-e39e4",
  storageBucket: "login-and-sign-up-e39e4.appspot.com",
  messagingSenderId: "1025789251454",
  appId: "1:1025789251454:web:ffe54a3db2f480737b6d2f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// If you want to customize the background notification handling, you can do so here.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Optional: a small icon for the notification
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
