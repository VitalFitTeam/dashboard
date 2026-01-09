"use client";

import { useState } from "react";
import { PasswordForm } from "./PasswordForm";
import { AccountForm } from "./AccountForm";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils"; 
import { User, Lock, Settings } from "lucide-react";

// Si no tienes un componente Separator, usa este simple div
const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-[1px] w-full bg-gray-200 dark:bg-gray-800", className)} />
);

type SettingsTab = "profile" | "security";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (loading) {
    return <div className="p-10 text-gray-500">Cargando perfil...</div>;
  }
  if (!user){
     return null;
  }

  const sidebarNavItems = [
    {
      id: "profile",
      title: "Perfil",
      icon: <User className="w-4 h-4 mr-2" />,
    },
    {
      id: "security",
      title: "Seguridad",
      icon: <Lock className="w-4 h-4 mr-2" />,
    },
  ];

  return (
   
    <div className="space-y-6 p-6 pb-16 md:p-10 max-w-7xl mx-auto dark:bg-gray-950 min-h-screen">

      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Configuración
        </h2>
        <p className="text-muted-foreground ">
          Administra la configuración de tu cuenta y preferencias.
        </p>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
 
        <aside className="lg:w-1/5 xl:w-1/6">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={cn(
                  "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  "text-left justify-start", 
                  activeTab === item.id
                    ? "bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-700" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                {item.title}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 lg:max-w-3xl">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Perfil
                </h3>
                <p className="text-sm text-gray-500">
                  Así es como te verán los demás en el sitio.
                </p>
              </div>
              <Separator />
              
              <div className="pt-2">
                 <AccountForm user={user} />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Seguridad
                </h3>
                <p className="text-sm text-gray-500">
                  Actualiza tu contraseña para mantener tu cuenta segura.
                </p>
              </div>
              <Separator />
              <div className="pt-2">
                <PasswordForm />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}