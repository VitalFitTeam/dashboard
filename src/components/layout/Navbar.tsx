"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SunIcon } from "@heroicons/react/24/outline";
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
import { NotificationBell } from "./notifications/NotificationBell"; 

const Navbar: React.FC = () => {
  const t = useTranslations("Navbar"); 
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("toggleMenu")}</span>
          </Button>
          <div className="hidden md:block">
            <DynamicBreadcrumb />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1 md:gap-4">

          <div className="flex items-center">
            <div className="relative hidden lg:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="flex h-9 w-40 xl:w-64 rounded-md border border-input bg-muted/50 px-9 py-1 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-muted-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("searchPlaceholder")}</span>
            </Button>
          </div>

          <nav className="flex items-center gap-1">
            <TooltipProvider>

              <NotificationBell />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
                    <SunIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">{t("appearance")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("appearance")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="mx-1 hidden h-4 w-[1px] bg-border sm:block" />
            
            <div className="scale-90 sm:scale-100">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;