"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/sdk-config";

export function useGetUser(userId: string | undefined, token: string | null) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !token) {
        return;
      }

      try {
        setLoading(true);
        const response = await api.user.GetUserByID(userId, token);
        if (response && response.data) {
          setUser(response.data);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, token]);

  return { user, loading, error };
}