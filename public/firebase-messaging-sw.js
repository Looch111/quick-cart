
// Import the Firebase scripts that are needed in the service worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// This self-executing async function fetches the config and initializes Firebase.
(async () => {
  try {
    // Fetch the configuration from our secure API endpoint.
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config in Service Worker');
    }
    const firebaseConfig = await response.json();

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    const messaging = firebase.messaging();

    // Set up the background message handler.
    // This is triggered when a push notification is received while the app is in the background.
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/logo.png' // Ensure logo.png is in your /public folder
      };

      // The service worker shows the notification to the user.
      return self.registration.showNotification(notificationTitle, notificationOptions);
    });

  } catch (error) {
    console.error('Error in Firebase Messaging service worker:', error);
  }
})();
