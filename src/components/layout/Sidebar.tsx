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
import { MegaphoneIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import { ROLE_I18N_KEY } from "@/lib/roleI18n";
export interface SubItem {
  nameKey: string;
  href: string;
}

export interface NavItemWithSub {
  nameKey: string;
  icon: React.ComponentType<{ className?: string }>;
  subitems: SubItem[];
}

export interface NavItemSimple {
  nameKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type NavItem = NavItemSimple | NavItemWithSub;

export interface NavSection {
  titleKey?: string;
  items: NavItem[];
}

export function isNavItemWithSub(item: NavItem): item is NavItemWithSub {
  return (item as NavItemWithSub).subitems !== undefined;
}

export const sidebarMenusByRole: Record<UserRole, NavSection[]> = {
  [UserRole.SUPER_ADMIN]: [
    {
      titleKey: "title_0", // Panel de Control Global
      items: [
        { nameKey: "menu_0_0", icon: HomeIcon, href: "/home" }, // Inicio (Dashboard)
        { nameKey: "menu_0_1", icon: BuildingStorefrontIcon, href: "/branches" }, // Gestión de Franquicias
      ],
    },
    {
      titleKey: "title_1", // Gestión Operacional
      items: [
        {
          nameKey: "menu_1_0", icon: UsersIcon, // Gestión de Socios/Clientes
          subitems: [
            { nameKey: "sub_1_0_0", href: "/crm/clients" }, // Listado de clientes
            { nameKey: "sub_1_0_1", href: "/crm/categories" }, // Segmentación y Categorías
            { nameKey: "sub_1_0_2", href: "/crm/feedback" }, // Quejas y Sugerencias
          ],
        },
        {
          nameKey: "menu_1_1", icon: CurrencyDollarIcon, // Membresías y Facturación
          subitems: [
            { nameKey: "sub_1_1_0", href: "/billing/memberships" }, // Gestión de Membresías
            { nameKey: "sub_1_1_1", href: "/billing/expiring" }, // Membresías por Vencer
            { nameKey: "sub_1_1_2", href: "/billing/discounts" }, // Descuentos y Post-Venta
            { nameKey: "sub_1_1_3", href: "/billing/invoices" }, // Facturas Electrónicas
          ],
        },
        {
          nameKey: "menu_1_2", icon: Calendar, // Operaciones de Clase/Sede
          subitems: [
            { nameKey: "sub_1_2_0", href: "/operations/calendar" }, // Calendario Global
            { nameKey: "sub_1_2_1", href: "/operations/reservations" }, // Reservas por bloque
            { nameKey: "sub_1_2_2", href: "/operations/classes" }, // Clases
          ],
        },
      ],
    },
    {
      titleKey: "title_2", // Administración del Sistema
      items: [
        {
          nameKey: "menu_2_0", icon: UserIcon, // Gestión de Usuarios y Roles
          subitems: [
            { nameKey: "sub_2_0_0", href: "/users/users" }, // Listado de Usuarios
            { nameKey: "sub_2_0_1", href: "/users/roles" }, // Roles y Matriz de Permisos
            { nameKey: "sub_2_0_2", href: "/users/audit" }, // Historial de Acceso (Audit Log)
            { nameKey: "sub_2_0_3", href: "/users/security" }, // Políticas de Seguridad
          ],
        },
        {
          nameKey: "menu_2_1", icon: ChartBar, // Configuración Maestra
          subitems: [
            { nameKey: "sub_2_1_0", href: "/catalog/memberships" }, // Tipos de Membresía
            { nameKey: "sub_2_1_1", href: "/catalog/services" }, // Servicios y Planes
            { nameKey: "sub_2_1_2", href: "/catalog/instructors" }, // Instructores
            { nameKey: "sub_2_1_3", href: "/catalog/equipment" }, // Equipamiento e Inventario
            { nameKey: "sub_2_1_4", href: "/catalog/promotions" }, // Promociones y Descuentos
            { nameKey: "sub_2_1_5", href: "/catalog/payment-methods" }, // Métodos de Pago
            { nameKey: "sub_2_1_6", href: "/catalog/cancellation-causes" }, // Causales de Cancelación
            { nameKey: "sub_2_1_7", href: "/catalog/fiscal-documents" }, // Documentos Fiscales
            { nameKey: "sub_2_1_8", href: "/catalog/packages" }, // Paquetes/Combos
          ],
        },
        {
          nameKey: "menu_2_2", icon: MegaphoneIcon, // Marketing y Contenidos
          subitems: [
            { nameKey: "sub_2_2_0", href: "/marketing/banners" }, // Galería de Servicios (CDN)
            { nameKey: "sub_2_2_1", href: "/marketing/merchandising" }, // Priorización y Merchandising
            { nameKey: "sub_2_2_2", href: "/marketing/cross-selling" }, // Cross-Selling Global
          ],
        },
      ],
    },
    {
      titleKey: "title_3", // Reportes y Data
      items: [
        { nameKey: "menu_3_0", icon: ChartBarIcon, href: "/reports/executive" }, // Dashboard Ejecutivo
        {
          nameKey: "menu_3_1", icon: ChartBarIcon, // Reportes y Analytics
          subitems: [
            { nameKey: "sub_3_1_0", href: "/reports/operational" }, // Reportes Operativos
            { nameKey: "sub_3_1_1", href: "/reports/financial" }, // Reportes Financieros
            { nameKey: "sub_3_1_2", href: "/reports/automation" }, // Exportación y Automatización
          ],
        },
      ],
    },
  ],

  [UserRole.BRANCH_ADMIN]: [
    {
      titleKey: "title_0", // Panel de Sucursal
      items: [
        { nameKey: "menu_0_0", icon: HomeIcon, href: "/home" }, // Inicio (Dashboard Sede)
        {
          nameKey: "menu_0_1", icon: BuildingStorefrontIcon, // Configuración de Sede
          subitems: [
            { nameKey: "sub_0_1_0", href: "/branches" }, // Datos de mi sucursal
          ],
        },
      ],
    },
    {
      titleKey: "title_1", // Operaciones Locales
      items: [
        {
          nameKey: "menu_1_0", icon: Calendar, // Gestión de Servicios
          subitems: [
            { nameKey: "sub_1_0_0", href: "/operations/classes" }, // Calendarización de Clases
            { nameKey: "sub_1_0_1", href: "/operations/reservations" }, // Seguimiento de Reservas
            { nameKey: "sub_1_0_2", href: "/operations/attendance" }, // Asistencia y Ocupación
          ],
        },
        {
          nameKey: "menu_1_1", icon: UsersIcon, // Gestión de Socios/Clientes
          subitems: [
            { nameKey: "sub_1_1_0", href: "/crm/clients" }, // Lista de Clientes de la Sede
            { nameKey: "sub_1_1_1", href: "/crm/clients/blocks" }, // Bloqueos y Justificaciones
            { nameKey: "sub_1_1_2", href: "/crm/clients/scoring" }, // Scoring y Categorización
          ],
        },
        {
          nameKey: "menu_1_2", icon: CurrencyDollarIcon, // Membresías y Cobranzas
          subitems: [
            { nameKey: "sub_1_2_0", href: "/billing/memberships" }, // Pagos y Membresías Activas
            { nameKey: "sub_1_2_1", href: "/billing/expiring" }, // Próximas a Vencer
          ],
        },
      ],
    },
    {
      titleKey: "title_2", // Reportes
      items: [
        { nameKey: "menu_2_0", icon: ChartBarIcon, href: "/reports/reports" }, // Reporte de Ventas por Sede
        { nameKey: "menu_2_1", icon: ChartBarIcon, href: "/reports/occupancy" }, // Reporte de Ocupación
      ],
    },
  ],

  [UserRole.INSTRUCTOR]: [
    {
      titleKey: "title_0", // Panel de Instructor
      items: [
        { nameKey: "menu_0_0", icon: HomeIcon, href: "/home" }, // Inicio
        { nameKey: "menu_0_1", icon: Calendar, href: "/operations/classes" }, // Gestión de Clases Asignadas
        { nameKey: "menu_0_2", icon: UsersIcon, href: "/operations/attendance" }, // Control de Asistencia
        {
          nameKey: "menu_0_3", icon: ChartBarIcon, // Seguimiento de Clientes y Rutinas
          subitems: [
            { nameKey: "sub_0_3_0", href: "/instructor/routines/assign" }, // Asignación de Rutinas
            { nameKey: "sub_0_3_1", href: "/instructor/routines/tracking" }, // Tracking de Progreso de Clientes
          ],
        },
      ],
    },
  ],

  [UserRole.ACCOUNTANT]: [
    {
      titleKey: "title_0", // Módulo Financiero
      items: [
        { nameKey: "menu_0_0", icon: HomeIcon, href: "/home" }, // Inicio
        {
          nameKey: "menu_0_1", icon: CurrencyDollarIcon, // Gestión de Facturación y Pagos
          subitems: [
            { nameKey: "sub_0_1_0", href: "/billing/invoicing" }, // Generación y Consulta de Facturas
            { nameKey: "sub_0_1_1", href: "/billing/payments" }, // Registro de Pagos y Comprobantes
            { nameKey: "sub_0_1_2", href: "/catalog/fiscalDocument" }, // Tipos de Documento Fiscal
          ],
        },
        {
          nameKey: "menu_0_2", icon: ChartBarIcon, // Análisis Financiero
          subitems: [
            { nameKey: "sub_0_2_0", href: "/finance/results" }, // Estado de Resultados por Sucursal
            { nameKey: "sub_0_2_1", href: "/finance/cashflow" }, // Flujo de Caja Proyectado
            { nameKey: "sub_0_2_2", href: "/finance/profitability" }, // Análisis de Rentabilidad
          ],
        },
      ],
    },
  ],

  [UserRole.DATA_ANALYST]: [
    {
      titleKey: "title_0",
      items: [
        { nameKey: "menu_0_0", icon: HomeIcon, href: "/home" },
        {
          nameKey: "menu_0_1", icon: ChartBarIcon,
          subitems: [
            { nameKey: "sub_0_1_0", href: "/analytics/reports/sales" }, // Reporte Detallado de Ventas
            { nameKey: "sub_0_1_1", href: "/analytics/reports/clients" }, // Reporte de Clientes y Asistencia
            { nameKey: "sub_0_1_2", href: "/analytics/reports/finance" }, // Reportes Financieros (Sólo Lectura)
          ],
        },
        {
          nameKey: "menu_0_2", icon: ChartBar, // Analytics Avanzado
          subitems: [
            { nameKey: "sub_0_2_0", href: "/analytics/advanced/clv" }, // CLV y Análisis RFM
            { nameKey: "sub_0_2_1", href: "/analytics/advanced/benchmarking" }, // Benchmarking y Desempeño Sede
            { nameKey: "sub_0_2_2", href: "/analytics/advanced/kpis" }, // Métricas Clave (Churn, NPS, RevPAS)
            { nameKey: "sub_0_2_3", href: "/analytics/advanced/api" }, // Integración con BI Tools
          ],
        },
      ],
    },
  ],

  [UserRole.RECEPTIONIST]: [
    {
      titleKey: "title_0", // Panel de Recepción
      items: [
        { nameKey: "menu_0_0", icon: HomeIcon, href: "/" }, // Inicio
        { nameKey: "menu_0_1", icon: UsersIcon, href: "/reception/checkin" }, // Check-in/out de Clientes
        {
          nameKey: "menu_0_2", icon: Calendar, // Gestión de Clases y Aforo
          subitems: [
            { nameKey: "sub_0_2_0", href: "/reception/calendar" }, // Calendario de Clases
            { nameKey: "sub_0_2_1", href: "/reception/capacity" }, // Aforo y Asistencia
          ],
        },
        { nameKey: "menu_0_3", icon: CurrencyDollarIcon, href: "/reception/payments" }, // Venta y Pagos
      ],
    },
  ],
};



export default function SidebarDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const t = useTranslations("sidebar");

  if (loading || !user) {
    return <SidebarMenuSkeleton />;
  }

  const role = user.role as UserRole;
  const roleI18nKey = ROLE_I18N_KEY[role];

  if (!roleI18nKey) {
    console.error("ROLE_I18N_KEY missing for role:", role);
    return null;
  }

  const rolePath = `roles.${roleI18nKey}`;
  const sections = sidebarMenusByRole[role];

  if (!sections) {
    console.error("No sidebar sections for role:", role);
    return null;
  }

  const handleMainModuleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    const segments = pathname.split("/").filter(Boolean);
    const currentModule = segments[1];
    const targetModule = href.split("/")[1];

    if (currentModule && targetModule && currentModule !== targetModule) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };

return (
  <Sidebar
    className="bg-card border-r border-border h-full w-64 flex flex-col"
  >
    <SidebarContent className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border transition-colors cursor-pointer hover:bg-muted/50">
        <Image
          src="/images/isotipo.png"
          alt="Logo Vitalfit"
          width={40}
          height={40}
          priority
          className="rounded-full border border-border"
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-sm font-semibold text-foreground truncate">
            {t("logoTitle")}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user.role_label}
          </span>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground ml-auto" />
      </div>

      <div className="flex-1 p-2 space-y-4">
        {sections.map((section, i) => (
          <SidebarGroup key={i}>
            {section.titleKey && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-1">
                {t(`${rolePath}.${section.titleKey}`)}
              </SidebarGroupLabel>
            )}

            <SidebarMenu className="space-y-1">
              {section.items.map((item) => {
                if (isNavItemWithSub(item)) {
                  const isAnySubActive = item.subitems.some(
                    (sub) => sub.href === pathname
                  );

                  return (
                    <Collapsible
                      key={item.nameKey}
                      defaultOpen={isAnySubActive}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                              isAnySubActive
                                ? "bg-orange-50 text-orange-600 font-semibold" 
                                : "text-foreground hover:bg-muted/50" 
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 ${
                                isAnySubActive
                                  ? "text-orange-400" 
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span className="flex-1 text-left">
                              {t(`${rolePath}.${item.nameKey}`)}
                            </span>
                            <ChevronDownIcon
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isAnySubActive ? "rotate-180" : ""
                              }`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub className="pl-6 space-y-1 mt-1">
                            {item.subitems.map((sub) => (
                              <SidebarMenuSubItem key={sub.nameKey}>
                                <Link
                                  href={sub.href}
                                  onClick={(e) =>
                                    handleMainModuleClick(e, sub.href)
                                  }
                                  className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    pathname === sub.href
                                      ? "text-orange-600 font-semibold bg-orange-50" 
                                      : "text-muted-foreground hover:bg-muted/50" 
                                  }`}
                                >
                                  {t(`${rolePath}.${sub.nameKey}`)}
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
                  <SidebarMenuItem key={item.nameKey}>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                        item.href === pathname
                          ? "bg-orange-50 text-orange-600 font-semibold"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleMainModuleClick(e, item.href)}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            item.href === pathname
                              ? "text-orange-600" 
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="flex-1 text-left">
                          {t(`${rolePath}.${item.nameKey}`)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </div>
      <div className="mt-auto border-t border-border px-4 py-3">
        <NavUser user={user} />
      </div>
    </SidebarContent>
  </Sidebar>
);
}