import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG || "{}",
);

export const getDeviceToken = async () => {
  if (typeof window === "undefined"){
     return null;
  }

  try {
    const savedToken = localStorage.getItem("fcm_token");
    if (savedToken){
        return savedToken;
    }

    const supported = await isSupported();
    if (!supported) {
        return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted"){
         return null;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    if (token) {
      localStorage.setItem("fcm_token", token);
      return token;
    }

    return null;
  } catch (error) {
    console.error("Error en Firebase:", error);
    return null;
  }
};