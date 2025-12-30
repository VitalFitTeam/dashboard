import { useState } from "react";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";

export function useUserByEmail(token: string) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);

  const getUserByEmail = async (email: string) => {
    if (!email || !email.includes("@")) {
      toast.error("Por favor, ingrese un email válido");
      return;
    }

    setLoading(true);
    try {
      const response = await api.user.getUserByEmail(email, token);

      setUserData(response); 
      return response.data;
    } catch (error: any) {
      setUserData(null);
      if (error.status === 404) {
        toast.error("Usuario no encontrado");
      } else {
        toast.error("Error al buscar el usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => setUserData(null);

  return { getUserByEmail, userData, loading, clearUser };
}