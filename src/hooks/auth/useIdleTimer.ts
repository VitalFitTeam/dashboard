"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

interface IdleConfig {
  idleTime: number;   
  warningTime: number;
}

export function useIdleTimer({ idleTime, warningTime }: IdleConfig) {
  const { logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
  }, [logout]);

  const stopAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
    }
    if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
    }
  }, []);

  const startTimers = useCallback(() => {
    stopAllTimers();

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, idleTime - warningTime);

    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, idleTime);
  }, [idleTime, warningTime, handleLogout, stopAllTimers]);

  useEffect(() => {

    if (!isAuthenticated) {
      stopAllTimers();
      return;
    }

    if (!showWarning) {
      const events = [
        "mousedown", 
        "mousemove", 
        "keypress", 
        "scroll", 
        "click", 
        "touchstart"
      ];

      const resetAction = () => startTimers();

      events.forEach((e) => window.addEventListener(e, resetAction));
      startTimers(); 

      return () => {
        events.forEach((e) => window.removeEventListener(e, resetAction));
      };
    }
  }, [isAuthenticated, showWarning, startTimers, stopAllTimers]);

  return { showWarning, setShowWarning };
}