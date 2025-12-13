"use client";

import { Calendar, ChartBar, UserIcon } from "lucide-react";
import {
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChartBarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Image from "next/image";
import { NavUser } from "./NavUser";
import { useAuth } from "@/context/AuthContext";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@/lib/roles";

export interface SubItem {
  name: string;
  href: string;
}

export interface NavItemWithSub {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subitems: SubItem[];
}

export interface NavItemSimple {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type NavItem = NavItemSimple | NavItemWithSub;

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export function isNavItemWithSub(item: NavItem): item is NavItemWithSub {
  return (item as NavItemWithSub).subitems !== undefined;
}

export const sidebarMenusByRole: Record<UserRole, NavSection[]> = {
  [UserRole.SUPER_ADMIN]: [
    {
      title: "Dashboard Principal",
      items: [
        { name: "Inicio", icon: HomeIcon, href: "/" },
        { name: "Sucursales", icon: BuildingStorefrontIcon, href: "/branches" },
        { name: "Clientes", icon: UserIcon, href: "/clients" },

        {
          name: "Calendario y Reservas",
          icon: Calendar,
          subitems: [
            { name: "Calendario", href: "/calendar" },
            { name: "Reservas por bloque", href: "/reservations" },
            { name: "Registro de Asistencia", href: "/attendance" },
          ],
        },

        {
          name: "Usuarios y Seguridad",
          icon: UsersIcon,
          subitems: [
            { name: "Usuarios", href: "/users" },
            { name: "Roles y permisos", href: "/users/audit" },
          ],
        },

        {
          name: "Membresías y Servicios",
          icon: CurrencyDollarIcon,
          subitems: [
            { name: "Membresías", href: "/memberships" },
            { name: "Métodos de Pagos", href: "/payment-methods" },
            { name: "Causales de Cancelación", href: "/causes" },
            { name: "Gestión de Membresías", href: "/administrator/membershipManagement" },
            { name: "Membresías por Vencer", href: "/administrator/membershipExpire" },
            { name: "Servicios", href: "/services" },
            { name: "Documento Fiscal", href: "/catalog/fiscalDocument" },
            { name: "Equipamiento", href: "/equipment" },
            { name: "Instructores", href: "/instructors" },
            { name: "Promociones", href: "/promotions" },
            { name: "Paquetes", href: "/packages" },
            { name: "Gestión Global de Banners", href: "/banners" },
          ],
        },

        {
          name: "Reportes y Finanzas",
          icon: ChartBar,
          subitems: [
            { name: "Clientes", href: "/reports/clients" }, 
            { name: "Finanzas", href: "/reports/financial" },
            { name: "Ventas", href: "/reports/sales" },
          ],
        },
      ],
    },
  ],

  [UserRole.BRANCH_ADMIN]: [
    {
      title: "Gestión de Sede",
      items: [
        { name: "Inicio", icon: HomeIcon, href: "/" },
        {
          name: "Mi sucursal",
          icon: BuildingStorefrontIcon,
          subitems: [
            { name: "Información General", href: "/branches" },
            { name: "Configuración de la sede", href: "/branches" },
          ],
        },
        {
          name: "Gestion de Clientes",
          icon: UserIcon,
          subitems: [
            { name: "Lista de Clientes", href: "/clients" },
            { name: "Historial", href: "/clients" },
          ],
        },
        {
          name: "Finanzas",
          icon: CurrencyDollarIcon,
          subitems: [
            { name: "Pagos y membresías", href: "/memberships" },
            { name: "Próximas a vencer", href: "/memberships" },
          ],
        },
        {
          name: "Calendario y Reservas",
          icon: Calendar,
          subitems: [
            { name: "Calendario", href: "/calendar" },
            { name: "Reservas Activas", href: "/reservations" },
            { name: "Historial de Reservas", href: "/attendance" },
          ],
        },
      ],
    },
  ],

  [UserRole.INSTRUCTOR]: [
    {
      title: "Panel del Instructor",
      items: [
        { name: "Inicio", icon: HomeIcon, href: "/" },
        { name: "Mis Clases", icon: Calendar, href: "/instructor/classes" },
        { name: "Asistencia", icon: UsersIcon, href: "/instructor/attendance" },
        {
          name: "Evaluaciones",
          icon: ChartBarIcon,
          href: "/instructor/reports",
        },
      ],
    },
  ],

  [UserRole.ACCOUNTANT]: [
    {
      title: "Finanzas",
      items: [
        { name: "Inicio", icon: HomeIcon, href: "/" },
        {
          name: "Facturación",
          icon: CurrencyDollarIcon,
          href: "/finance/billing",
        },
        { name: "Reportes", icon: ChartBarIcon, href: "/finance/reports" },
      ],
    },
  ],

  [UserRole.DATA_ANALYST]: [
    {
      title: "Análisis de Datos",
      items: [
        { name: "Inicio", icon: HomeIcon, href: "/" },
        { name: "Reportes", icon: ChartBarIcon, href: "/analytics/reports" },
        { name: "Tendencias", icon: ChartBar, href: "/analytics/trends" },
      ],
    },
  ],

  [UserRole.RECEPTIONIST]: [
    {
      title: "Panel de Recepción",
      items: [
        { name: "Inicio", icon: HomeIcon, href: "/" },
        { name: "Clientes", icon: UsersIcon, href: "/clients" },
        { name: "Reservas", icon: Calendar, href: "/reservations" },
        { name: "Pagos", icon: CurrencyDollarIcon, href: "/payments" },
      ],
    },
  ],
};


export default function SidebarDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <SidebarMenuSkeleton />;
  }
  const sections = user.role ? sidebarMenusByRole[user.role] : [];
  
  const safeSections = sections || [];

  const handleMainModuleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const currentModule = pathname.split("/")[1];
    const targetModule = href.split("/")[1];

    if (currentModule && targetModule && currentModule !== targetModule) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-white border-r border-gray-200 shadow-lg w-64"
    >
      <SidebarContent className="flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
          <Image
            src="/images/isotipo.png"
            alt="Logo Vitalfit"
            width={48}
            height={48}
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">VITALFIT</span>
            <span className="text-xs text-gray-500">
              {user.role_label}
            </span>
          </div>
          <ChevronDownIcon className="ml-auto h-5 w-5 text-gray-400" />
        </div>

        {safeSections.map((section, i) => (
          <SidebarGroup key={i} className="mt-2">
            {section.title && (
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            )}
            <SidebarMenu className="space-y-1 px-1">
              {section.items.map((item) => {
                if (isNavItemWithSub(item)) {
                  const isAnySubActive = item.subitems.some(
                    (sub) => sub.href === pathname,
                  );
                  return (
                    <Collapsible key={item.name} defaultOpen={isAnySubActive}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isAnySubActive
                              ? "bg-gray-100 text-orange-400 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            <item.icon
                              className={`h-4 w-4 ${isAnySubActive
                                ? "text-orange-400"
                                : "text-gray-600"
                                }`}
                            />
                            <span className="flex-1">{item.name}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="pl-6 space-y-1">
                            {item.subitems.map((sub) => (
                              <SidebarMenuSubItem key={sub.name}>
                                <Link
                                  href={sub.href}
                                  onClick={(e) => handleMainModuleClick(e, sub.href)}
                                  className={`block px-2 py-1 rounded-md text-sm transition-colors ${pathname === sub.href
                                    ? " text-orange-400 font-medium"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                  {sub.name}
                                </Link>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${item.href === pathname
                        ? "bg-gray-100 text-orange-400 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleMainModuleClick(e, item.href)}
                        className="flex items-center gap-2 w-full"
                      >
                        <item.icon
                          className={`h-4 w-4 ${item.href === pathname
                            ? "text-orange-600"
                            : "text-gray-600"
                            }`}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        <div className="mt-auto border-t border-gray-200 px-3 py-4">
          <NavUser user={user} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}