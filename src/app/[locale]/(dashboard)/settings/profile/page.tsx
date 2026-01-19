"use client";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils"; 
import { User, Lock, Bell } from "lucide-react";
import { PasswordForm } from "./PasswordForm";
import { AccountForm } from "./AccountForm";
import { ActivityNotifications } from "./ActivityNotifications";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";

const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-[1px] w-full bg-gray-200 dark:bg-gray-800", className)} />
);

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const params = useParams();

  // Obtenemos la pestaña actual de la URL (ej: 'profile', 'security')
  // Esto asume que tu estructura de archivos es app/[locale]/settings/[tab]/page.tsx
  const activeTab = params.tab as string || "profile";

  if (loading) return <div className="p-10 text-gray-500">Cargando perfil...</div>;
  if (!user) return null;

  const sidebarNavItems = [
    {
      id: "profile",
      title: "Perfil",
      href: "/settings/profile",
      icon: <User className="w-4 h-4 mr-2" />,
    },
    {
      id: "notifications",
      title: "Notificaciones",
      href: "/settings/profile/notifications",
      icon: <Bell className="w-4 h-4 mr-2" />,
    },
    {
      id: "security",
      title: "Seguridad",
      href: "/settings/profile/security",
      icon: <Lock className="w-4 h-4 mr-2" />,
    },
  ];

  return (
    <div className="space-y-6 p-6 pb-16 md:p-10 max-w-7xl mx-auto dark:bg-gray-950 min-h-screen">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Configuración
        </h2>
        <p className="text-muted-foreground">
          Administra la configuración de tu cuenta y preferencias.
        </p>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5 xl:w-1/6">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => {
              // Verificamos si la ruta actual coincide con el item
              const isActive = activeTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 font-semibold"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 lg:max-w-3xl">
          {/* Contenido Condicional según la URL */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-medium">Perfil</h3>
              <p className="text-sm text-gray-500">Configura tu información pública.</p>
              <Separator />
              <AccountForm user={user} />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-medium">Notificaciones de Actividad</h3>
              <p className="text-sm text-gray-500">Gestiona tus preferencias de avisos.</p>
              <Separator />
              <ActivityNotifications />
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-medium">Seguridad</h3>
              <p className="text-sm text-gray-500">Actualiza tus credenciales.</p>
              <Separator />
              <PasswordForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}