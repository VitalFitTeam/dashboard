"use client";

import React from "react";
import { useTranslations } from "next-intl"; // Importamos el hook de traducción
import {
  BellIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { Menu, Search } from "lucide-react";

import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import LocaleSwitcher from "./localeSwitcher/LocaleSwitcher";

const Navbar: React.FC = () => {
  const t = useTranslations("Navbar"); // Hook para acceder a las traducciones
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        
        {/* IZQUIERDA: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("toggleMenu")}</span>
          </Button>
          
          <div className="hidden sm:block">
            <DynamicBreadcrumb />
          </div>
        </div>

        {/* DERECHA: Actions & Search */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          
          {/* Buscador Responsive */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="flex h-9 w-64 rounded-md border border-input bg-muted/50 px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("searchPlaceholder")}</span>
            </Button>
          </div>

          <nav className="flex items-center gap-1">
            <TooltipProvider>
              {/* Notificaciones */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <BellIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-orange-600 border-2 border-background" />
                    <span className="sr-only">{t("notifications")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("notifications")}</TooltipContent>
              </Tooltip>

              {/* Tema */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <SunIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">{t("appearance")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("appearance")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="mx-2 hidden h-4 w-[1px] bg-border md:block" />

            {/* Selector de Idioma */}
            <LocaleSwitcher />
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;