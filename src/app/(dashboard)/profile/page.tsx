"use client";
import { TabSelector } from "@/components/TabSelector";
import { fetchAPI } from "@/lib/api";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { PasswordForm } from "./PasswordForm";
import { AccountForm } from "./AccountForm";
import UserCard from "@/components/UserCard";

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
      redirect("/login");
    }

    fetchAPI("/user/whoami", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
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

  const tabs = [
    {
      value: "Personal",
      label: "Datos Personales",
      content: <AccountForm user={user} />,
    },
    {
      value: "Password",
      label: "Password",
      content: <PasswordForm />,
    },
  ];

  return (
    <section className="flex flex-col justify-start  bg-white rounded-xl shadow-sm p-6 mt-8">
      {user && (
        <UserCard
          name={`${user.first_name} ${user.last_name}`}
          role={user.role?.name || "Sin rol"}
          avatarUrl={user.profile_picture_url || "/logo/isotipo.png"}
        />
      )}
      <TabSelector tabs={tabs} defaultValue="Personal" />
    </section>
  );
}
