"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export function NotificationSync() {
  const { token } = useAuth();
  const { refresh } = useNotifications(token || "");

  useEffect(() => {
    if (!messaging || !token) {
        return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => console.log("SW registrado:", reg.scope))
        .catch((err) => console.error("Error registrando SW:", err));
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Notificación recibida:", payload);
      
      toast.info(payload.notification?.title || "VitalFit", {
        description: payload.notification?.body,
        icon: <Bell className="h-4 w-4 text-orange-600" />,
        duration: 5000,
      });

      refresh(); 
    });

    return () => unsubscribe();
  }, [token, refresh]);

  return null; 
}