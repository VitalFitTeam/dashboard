import { UserRole } from "@/lib/roles";

import { Calendar, ChartBar, UserIcon, Megaphone } from "lucide-react";

import {
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChartBarIcon,
  HomeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import { NavSection } from "./sidebar.types";

export const sidebarMenusByRole: Record<UserRole, NavSection[]> = {
  [UserRole.SUPER_ADMIN]: [
    {
      title: "General", 
      items: [
        { label: "Dashboard", icon: HomeIcon, href: "/" },
        { label: "Sucursales",  icon: BuildingStorefrontIcon, href: "/branches"}, 
      ],
    },
    {
      title: "Administracion", 
      items: [
        {
          label: "UsuariosRoles", 
          icon: UsersIcon,
          subitems: [
            { label: "UsuariosSistema", href: "/users/users" }, 
            { label: "RolesPermisos", href: "/users/roles" },
            { label: "AuditoriaAccesos", href: "/users/audit" },
          ],
        },
        {
          label: "CatalogoSistema", 
          icon: UsersIcon,
          subitems: [
            { label: "TiposMembresia",  href: "/catalog/memberships" },
            { label: "Servicios",  href: "/catalog/services" },
            { label: "Instructores", href: "/catalog/instructors" },
            { label: "InventarioEquipamiento",  href: "/catalog/equipment" },
            { label: "DocumentosFiscales", href: "/catalog/fiscal-documents" },
            { label: "MetodosPagoGlobal", href: "/catalog/payment-methods" },
            { label: "CausalesCancelacion", href: "/catalog/cancellation-reason" },
            { label: "CombosPaquetes", href: "/catalog/packages" },
          ],
        },
      ],
    },
    {
      title: "Operacion",
      items: [
        {
          label: "ClientesSocios", 
          icon: UserIcon,
          subitems: [
            { label: "RegistroConsulta", href: "/clients/register" }, 
            { label: "SegmentacionScoring", href: "/clients/scoring" },
            { label: "QuejasSugerencias", href: "/clients/feedback" },
          ],
        },
        {
          label: "CalendarioAsistencia",
          icon: Calendar,
          subitems: [
            { label: "CalendarioClases", href: "/operations/calendar" },
            { label: "GestionReservas", href: "/operations/reservations" },
            { label: "TrackingAsistencia", href: "/operations/attendance" },
          ],
        },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { label: "FacturacionElectronica", icon: CurrencyDollarIcon, href: "/finance/billing" },
        {
          label: "MembresiasControl",
          icon: CurrencyDollarIcon,
          subitems: [
            { label: "GestionMembresias", href: "/finance/memberships" },
            { label: "AlertasVencimiento", href: "/finance/expiration-alerts" },
          ],
        },
        { label: "ReportesFinancieros",
          icon: ChartBarIcon, 
          subitems: [
            { label: "ReporteClientes", href: "/analytics/reports/clients" },
            { label: "ReporteFinanciero", href: "/analytics/reports/financial" },
            { label: "ReporteVentas", href: "/analytics/reports/sales" },
          ],
        },
      ],
    },
    {
      title: "Marketing",
      items: [
         { 
          label: "GestionMarketing",
          icon: Megaphone, 
          subitems: [
            { label: "GestionBanners",  href: "/marketing/banners" },
            { label: "Promociones",href: "/marketing/promotions" },
            { label: "MerchandisingCrosssell", href: "/marketing/merchandising" },
          ],
        },
      ],
    },
    {
      title: "Configuracion", 
      items: [
        { 
            label: "AjustesSistema", 
            icon: Cog6ToothIcon, 
            subitems: [
                { label: "PoliticasContrasena", href: "/catalog/password" },
            ]
        },
      ],
    },
  ],

  [UserRole.BRANCH_ADMIN]: [
    {
      title: "General",
      items: [
        { label: "DashboardOperativo", icon: HomeIcon, href: "/" },
        
        {
          label: "ConfiguracionLocal",
          icon: BuildingStorefrontIcon,
          subitems: [
            { label: "InformacionHorarios", href: "/branches/active/edit", },
          ],
        },
      ],
    },
    {
      title: "Operacion",
      items: [
        { label: "ClientesSocios", icon: UserIcon, href: "/clients" },
        { label: "AgendaCalendario", icon: Calendar, href: "/operations/calendar" },
        { label: "ReservasActivas", icon: Calendar, href: "/operations/reservations" },
        { label: "RegistroAsistencia", icon: UsersIcon, href: "/operations/attendance" },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { label: "RegistroPagos", icon: CurrencyDollarIcon, href: "/finance/billing"},
        { label: "GestionMembresias", icon: CurrencyDollarIcon, href: "/finance/memberships" },
        { label: "ReporteVentasLocal", icon: ChartBarIcon, href: "/finance/sales-report" },
      ],
    },
  ],

  [UserRole.INSTRUCTOR]: [
    {
      title: "Instructor",
      items: [
        { label: "Dashboard", icon: HomeIcon, href: "/" },
        { label: "MiCalendario", icon: Calendar, href: "/instructor/calendar" },
        { label: "RegistroAsistencia", icon: UsersIcon, href: "/instructor/attendance" },
        { label: "MisReportes", icon: ChartBarIcon, href: "/instructor/reports" },
      ],
    },
  ],

 [UserRole.ACCOUNTANT]: [
    {
      title: "Finanzas",
      items: [
        { label: "Dashboard", icon: HomeIcon, href: "/" },
        { label: "FacturacionElectronica", icon: CurrencyDollarIcon, href: "/finance/billing" },
        { label: "ReportesFinancieros", icon: ChartBarIcon, href: "/finance/reports" },
      ],
    },
  ],

  [UserRole.DATA_ANALYST]: [
    {
      title: "Analytics",
      items: [
        { label: "Dashboard", icon: HomeIcon, href: "/" },
        { label: "ReportesDetallados", icon: ChartBarIcon, href: "/analytics/reports" },
        { label: "TendenciasCohortes", icon: ChartBar, href: "/analytics/trends" },
      ],
    },
  ],

  [UserRole.RECEPTIONIST]: [
    {
      title: "Recepcion",
      items: [
        { label: "Dashboard", icon: HomeIcon, href: "/" },
        { label: "ClientesSocios", icon: UsersIcon, href: "/clients" },
        { label: "CheckinCheckout", icon: UsersIcon, href: "/operations/attendance" },
        { label: "GestionReservas", icon: Calendar, href: "/operations/reservations" },
        { label: "RegistroPagos", icon: CurrencyDollarIcon, href: "/payments" },
        { label: "QuejasSugerencias", icon: Megaphone, href: "/clients/feedback" },
      ],
    },
  ],
};