"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  TicketIcon,
  MegaphoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

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
      { name: "Dashboard", href: "#", icon: HomeIcon },
      { name: "Sucursales", href: "#", icon: BuildingStorefrontIcon },
      { name: "Usuarios Admin", href: "#", icon: UsersIcon },
      { name: "Promos y cupones", href: "#", icon: TicketIcon },
      { name: "Anuncios", href: "#", icon: MegaphoneIcon },
    ],
  },
  {
    title: "Reportes y estadísticas",
    items: [{ name: "Reportes", href: "#", icon: ChartBarIcon }],
  },
  {
    title: "Otros",
    items: [
      { name: "Configuración", href: "#", icon: Cog6ToothIcon },
      { name: "Centro de ayuda", href: "#", icon: QuestionMarkCircleIcon },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-white">
      <div className="flex items-center gap-3 px-6 pt-2">
        <div className="flex items-center gap-3 border border-blue-50 rounded-lg px-5 py-2">
          <img
            src="/assets/images/isotipo 1.svg"
            alt="Logo Vitalfit"
            width={32}
          />{" "}
          {/* Cambia aquí la forma de importar el logo */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">VITALFIT</span>
            <span className="text-xs text-gray-500">Super Admin</span>
          </div>
          <ChevronDownIcon className="ml-auto h-4 w-4 text-gray-400" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            {section.title && (
              <h3 className="mb-2 px-3 text-xs text-gray-500">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-1">
          <button
            onClick={() => {
              console.log("Cerrar sesión");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm  text-red-600 transition-colors hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 border border-blue-50 rounded-lg px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-700">
              A
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-gray-900">
                Albani Barragan
              </span>
              <span className="truncate text-xs text-gray-500">
                albani@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
