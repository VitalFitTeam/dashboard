import React from "react";
import { typography, colors } from "@/styles/styles";

const Navbar: React.FC = () => {
  return (
    <div
      className={`flex items-center justify-between ${colors.complementary.white}`}
      style={{
        padding: "0.5rem 1rem",
        borderBottom: `1px solid ${colors.complementary.lightGray}`,
      }}
    >
      <div className="flex items-center space-x-6">
        <img src="/button.svg" alt="Button Icon" className="w-9 h-9" />
        <span
          className={`text-${colors.complementary.lightGray} ${typography.body}`}
          style={{
            fontFamily: "var(--font-montserrat)",
            color: colors.complementary.lightGray,
          }}
        >
          Dashboards
        </span>
        <span
          className={`text-${colors.complementary.lightGray}`} // Color gris claro para el separador
        >
          /
        </span>
        <span
          className={`text-black ${typography.body}`}
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Default
        </span>
      </div>

      <div className="flex items-center space-x-20">
        {" "}
        {/* Espaciado ajustado */}
        {/* Icono de Notificación */}
        <img src="/bell.svg" alt="Notificaciones" className="w-7 h-7" />
        {/* Icono de Luz */}
        <img src="/sun.svg" alt="Luz" className="w-7 h-7" />
        {/* Campo de Búsqueda */}
        <div className="relative">
          {" "}
          {/* Contenedor relativo para el icono */}
          <input
            type="text"
            placeholder="Search"
            className={`py-1 pl-10 pr-4 outline-none ${typography.body} text-${colors.complementary.lightGray}`}
            style={{
              fontFamily: "var(--font-montserrat)",
              border: `1px solid ${colors.complementary.lightGray}`,
              borderRadius: "0.6rem",
              width: "300px",
            }}
          />
          <img
            src="/magnifying-glass.svg"
            alt="Buscar"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer"
          />{" "}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
