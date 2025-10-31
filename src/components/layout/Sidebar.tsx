"use client";

import {
  ArrowRightCircle,
  Building2,
  Calendar,
  ChartBar,
  Home,
  Layers,
  User,
  UserIcon,
} from "lucide-react";
import {
  Cog6ToothIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

interface SubItem {
  name: string;
  href: string;
}
const currentUser = {
  name: "Albani Barragán",
  email: "albani@gmail.com",
};

interface NavItemWithSub {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subitems: SubItem[];
}

interface NavItemSimple {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

type NavItem = NavItemSimple | NavItemWithSub;

interface NavSection {
  title?: string;
  items: NavItem[];
}

function isNavItemWithSub(item: NavItem): item is NavItemWithSub {
  return (item as NavItemWithSub).subitems !== undefined;
}

const currentUserRole = "SuperAdmin";

export default function SidebarDashboard() {
  const pathname = usePathname();

  const sidebarMenusByRole: Record<string, NavSection[]> = {
    SuperAdmin: [
      {
        title: "Dashboard Principal",
        items: [
          {
            name: "Home",
            icon: BuildingStorefrontIcon,
            href: "/",
          },
          {
            name: "Sucursales",
            icon: BuildingStorefrontIcon,
            href: "/branches",
          },
          { name: "Clientes", icon: UserIcon, href: "/clients" },
          {
            name: "Usuarios y Seguridad",
            icon: UsersIcon,
            subitems: [
              { name: "Usuarios", href: "/users" },
              { name: "Políticas de seguridad", href: "/users/management" },
              { name: "Configuración de roles", href: "/users/audit" },
            ],
          },
          {
            name: "Membresías y Servicios",
            icon: CurrencyDollarIcon,
            subitems: [
              { name: "Membresías", href: "/memberships" },
              { name: "Servicios", href: "/services" },
              { name: "Instructores", href: "/instructors" },
              { name: "Equipamiento", href: "/equipament" },
              { name: "Promociones y descuentos", href: "/promotions" },
              { name: "Métodos de pago globales", href: "/payment-methods" },
              { name: "Tipos de documentos fiscales", href: "/tax-documents" },
            ],
          },
          {
            name: "Clases y Reservas",
            icon: Calendar,
            subitems: [{ name: "Calendario", href: "/classes" }],
          },
          {
            name: "Finanzas y Reportes",
            icon: ChartBar,
            subitems: [
              { name: "Facturación", href: "/finance/billing" },
              { name: "Reportes", href: "/finance/reports" },
              {
                name: "Reconciliación de pagos",
                href: "/finance/reconciliation",
              },
            ],
          },
        ],
      },
    ],
  };

  const sections = sidebarMenusByRole[currentUserRole] || [];

  return (
    <Sidebar>
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
            <span className="text-xs text-gray-500">{currentUserRole}</span>
          </div>
          <ChevronDownIcon className="ml-auto h-5 w-5 text-gray-400" />
        </div>
        {sections.map((section, i) => (
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
                    <Collapsible
                      key={item.name}
                      defaultOpen={isAnySubActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                              isAnySubActive
                                ? "bg-gray-100 text-orange-400 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 ${isAnySubActive ? "text-orange-400" : "text-gray-600"}`}
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
                                  className={`block px-2 py-1 rounded-md text-sm transition-colors ${
                                    pathname === sub.href
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        item.href === pathname
                          ? "bg-gray-100 text-orange-400 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 w-full"
                      >
                        <item.icon
                          className={`h-4 w-4 ${item.href === pathname ? "text-orange-600" : "text-gray-600"}`}
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
          <NavUser user={currentUser} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
