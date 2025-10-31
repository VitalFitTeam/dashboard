import React from "react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { typography, colors } from "@/styles/styles";

import { DynamicBreadcrumb } from "./DynamicBreadcrumb";

const Navbar: React.FC = () => {
  return (
    <div
      className={
        "h-14 border-b border-gray-300 flex items-center justify-between px-6 bg-white"
      }
    >
      <DynamicBreadcrumb />

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notificaciones"
        >
          <BellIcon className="w-6 h-6 text-gray-700" />
        </button>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cambiar tema"
        >
          <SunIcon className="w-6 h-6 text-gray-700" />
        </button>
        {/* Campo de Búsqueda */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className={`pl-10 pr-4 py-1.5 border text-sm rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none ${typography.body}`}
            style={{
              color: colors.complementary.black,
              borderColor: colors.complementary.lightGray,
              width: "280px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
