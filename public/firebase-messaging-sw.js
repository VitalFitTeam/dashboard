importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyBkMQFErGX8NX1Fm-nWU74v7EBjcJgqsIQ",
  authDomain: "vitalfitdcyt-36426.firebaseapp.com",
  projectId: "vitalfitdcyt-36426",
  storageBucket: "vitalfitdcyt-36426.firebasestorage.app",
  messagingSenderId: "797852705802",
  appId: "1:797852705802:web:6c90e8570014274edfabf3",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[sw.js] Recibido mensaje en segundo plano:", payload);

  const notificationTitle = payload.notification?.title || "VitalFit Alerta";
  const notificationOptions = {
    body: payload.notification?.body || "Nueva actividad en tu cuenta",
    icon: "/logo-vitalfit.png",
    badge: "/badge-icon.png", 
    tag: "vitalfit-notification", 
    data: {
      url: "/settings/profile?tab=activity", 
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close(); 

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      }),
  );
});
