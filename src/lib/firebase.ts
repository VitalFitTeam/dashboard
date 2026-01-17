import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBkMQFErGX8NX1Fm-nWU74v7EBjcJgqsIQ",
  authDomain: "vitalfitdcyt-36426.firebaseapp.com",
  projectId: "vitalfitdcyt-36426",
  storageBucket: "vitalfitdcyt-36426.firebasestorage.app",
  messagingSenderId: "797852705802",
  appId: "1:797852705802:web:6c90e8570014274edfabf3"
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const messaging: Messaging | null = typeof window !== "undefined" ? getMessaging(app) : null;

export { app, messaging, firebaseConfig };