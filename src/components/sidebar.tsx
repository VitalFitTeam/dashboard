"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CalendarIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Menú principal",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
      { name: "Sucursales", href: "/branches", icon: BuildingStorefrontIcon },
      { name: "Usuarios Admin", href: "/dashboard/usuarios", icon: UsersIcon },
      {
        name: "Servicios",
        href: "/dashboard/promos",
        icon: CurrencyDollarIcon,
      },
      { name: "Clientes", href: "/dashboard/anuncios", icon: UserIcon },
    ],
  },
  {
    title: "Reportes y estadísticas",
    items: [
      { name: "Reportes", href: "/dashboard/reportes", icon: ChartBarIcon },
      { name: "Calendario", href: "/dashboard/calendario", icon: CalendarIcon },
    ],
  },
  {
    title: "Otros",
    items: [
      {
        name: "Configuración",
        href: "/dashboard/configuracion",
        icon: Cog6ToothIcon,
      },
      {
        name: "Centro de ayuda",
        href: "/dashboard/ayuda",
        icon: QuestionMarkCircleIcon,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white border-r border-gray-200 shadow-sm",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <Image
          src="/images/isotipo.png"
          alt="Logo Vitalfit"
          width={48}
          height={48}
          priority
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">VITALFIT</span>
          <span className="text-xs text-gray-500">Super Admin</span>
        </div>
        <ChevronDownIcon className="ml-auto h-4 w-4 text-gray-400" />
      </div>

      {/* Navigation Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigationSections.map((section, i) => (
          <div key={i} className="mb-5">
            {section.title && (
              <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map(({ name, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={name}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-blue-600" : "text-gray-500",
                        )}
                      />
                      <span>{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Cerrar sesión */}
        <div className="mt-6">
          <button
            onClick={() => console.log("Cerrar sesión")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightCircleIcon className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Footer fijo (usuario) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
            A
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              Albani Barragán
            </span>
            <span className="truncate text-xs text-gray-500">
              albani@gmail.com
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
