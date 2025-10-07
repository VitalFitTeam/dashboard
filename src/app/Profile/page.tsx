"use client";
import TabSelector from "@/components/TabSelector";
import UserCard from "@/components/userCard";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    role: {
      name: string;
      description: string;
      level: number;
    };
    profile_picture_url: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchAPI("/user/whoami", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        console.log("Datos del usuario:", data);
        setUser(data.user);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Cargando usuario...</p>;
  }
  if (!user) {
    return <p>No se pudo cargar la información del usuario.</p>;
  }

  return (
    <section className="flex flex-col items-center justify-start  bg-white rounded-xl shadow-sm p-6 mt-8">
      {user && (
        <UserCard
          name={`${user.first_name} ${user.last_name}`}
          role={user.role?.name || "Sin rol"}
          avatarUrl={user.profile_picture_url || "/logo/isotipo.png"}
        />
      )}
      <TabSelector />
    </section>
  );
}
