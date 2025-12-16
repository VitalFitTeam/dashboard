"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { sidebarMenusByRole } from "./sidebar.config";
import { SidebarItem } from "./SidebarItem";
import { useSidebarNavigation } from "./useSidebarNavigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { NavUser } from "../NavUser";
import { useTranslations } from "next-intl";

export default function SidebarDashboard() {
  const { user, loading } = useAuth();
  const { pathname, navigate } = useSidebarNavigation();
  const t = useTranslations("Menu"); 

  if (loading || !user) {
    return <SidebarMenuSkeleton />;
  }

  const sections = sidebarMenusByRole[user.role] ?? [];

  return (
    <Sidebar collapsible="offcanvas" className="w-64 border-r bg-white">
      <SidebarContent className="flex flex-col h-full">
        <header className="flex items-center gap-3 px-6 py-4 border-b">
          <Image src="/images/isotipo.png" alt="Logo" width={40} height={40} />
          <div>
            <p className="text-sm font-bold">VITALFIT</p>
            <p className="text-xs text-gray-500">{user.role_label}</p>
          </div>
        </header>

       {sections.map((section) => (
          <SidebarGroup key={section.title}>
            {section.title && (
              <SidebarGroupLabel>{t(section.title as any)}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={navigate}
                  t={t} 
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        <div className="mt-auto border-t p-4">
          <NavUser user={user} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
