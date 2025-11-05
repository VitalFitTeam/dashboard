"use client";
import React from "react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { typography, colors } from "@/styles/styles";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

const Navbar: React.FC = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      {/* IZQUIERDA */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </Button>

        <div className="hidden md:flex">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className={`pl-10 pr-4 py-1.5 rounded-md border text-sm focus:ring-1 focus:ring-orange-300 focus:border-orange-300 outline-none transition-colors ${typography.body}`}
            style={{
              color: colors.complementary.black,
              borderColor: colors.complementary.lightGray,
              width: "260px",
            }}
          />
        </div>

        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notificaciones"
        >
          <BellIcon className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-orange-500"></span>
        </button>

        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cambiar tema"
        >
          <SunIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
