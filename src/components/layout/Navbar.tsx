"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { 
  Menu, 
  Search, 
  Sun, 

} from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import LocaleSwitcher from "./localeSwitcher/LocaleSwitcher";
import { useAuth } from "@/context/AuthContext";
import { Input } from "../ui/Input";
import { NotificationCenter } from "./NotificationCenter";

const Navbar: React.FC = () => {
  const t = useTranslations("Navbar");
  const { toggleSidebar } = useSidebar();
  const {token} = useAuth();
  if(!token){
    return;
  }


  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:h-9 md:w-9"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("toggleMenu")}</span>
          </Button>
          
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          
          <div className="hidden sm:block">
            <DynamicBreadcrumb />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">

          <div className="relative w-full max-w-[300px] hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              className="pl-9 bg-muted/50 focus-visible:ring-1"
            />
          </div>

          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            <TooltipProvider delayDuration={300}>
              <NotificationCenter jwt={token} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Sun className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">{t("appearance")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t("appearance")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <LocaleSwitcher />
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;