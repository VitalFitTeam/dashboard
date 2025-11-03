"use client";
import { PasswordForm } from "./PasswordForm";
import { AccountForm } from "./AccountForm";
import UserCard from "@/components/layout/UserCard";
import { TabSelector } from "@/components/ui/TabSelector";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();

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
    <section className="flex flex-col justify-start bg-white rounded-xl shadow-sm p-6 mt-8">
      <UserCard
        name={`${user.first_name} ${user.last_name}`}
        role={user.role || "Sin rol"}
        avatarUrl={user.profile_picture_url || "/logo/isotipo.png"}
      />
      <TabSelector tabs={tabs} defaultValue="Personal" />
    </section>
  );
}
