// components/TabSelector.tsx (Versión Final con Estilos)
"use client";
import React, { useState } from "react";
// Asegúrate de que estos componentes existan y estén exportados correctamente
import { AccountForm } from "./AccountForm";
import { PasswordForm } from "./PasswordForm";

type TabKey = "account" | "password";

// Componente Tab (Botón individual)
interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-3 px-6 text-center font-semibold text-base transition-colors duration-200 ease-in-out
        
        ${isActive ? "bg-white text-gray-800" : "bg-transparent text-gray-500 hover:text-gray-700"}`}
    >
      {label}
    </button>
  );
};

const TabSelector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("account");

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountForm />;
      case "password":
        return <PasswordForm />;
      default:
        return null;
    }
  };

  return (
    <div
      // CLASES DEL CONTENEDOR: Borde exterior, esquinas y fondo gris sutil
      className="w-full max-w-3xl mx-auto
                 border border-gray-200 rounded-xl bg-gray-50
                 overflow-hidden shadow-sm"
    >
      <div className="flex">
        {/* Usamos el componente Tab para aplicar la lógica de estilos */}
        <Tab
          label="Account"
          isActive={activeTab === "account"}
          onClick={() => setActiveTab("account")}
        />
        <Tab
          label="Password"
          isActive={activeTab === "password"}
          onClick={() => setActiveTab("password")}
        />
      </div>

      {/* El contenido necesita el fondo blanco para contrastar */}
      <div className="bg-white">{renderTabContent()}</div>
    </div>
  );
};

export default TabSelector;
