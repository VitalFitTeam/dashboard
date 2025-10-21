"use client";
import { Column, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { useState } from "react";
import { Users } from "@/types/users";
import { UsersData } from "./data";

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);

  const handleEditUser = (user: Users) => {
    setSelectedUser(user);
    alert("Editar detalles del usuario");
    // Lógica para abrir el modal de edición
  };
  const handleViewDetails = (user: Users) => {
    setSelectedUser(user);
    alert("Ver detalles del usuario");
    // Lógica para abrir el modal de detalles
  };

  const columns: Column<Users>[] = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name", filterType: "text" },
    { header: "Email", accessor: "email" },
    {
      header: "Rol",
      accessor: "rol",
      filterType: "select",
      filterOptions: [
        { label: "Administrador", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ],
    },
    {
      header: "Status",
      accessor: "status",
      filterType: "select",
      filterOptions: [
        { label: "Activa", value: "active" },
        { label: "Inactiva", value: "inactive" },
        { label: "En mantenimiento", value: "maintenance" },
      ],
      render: (value) => {
        const statusConfig = {
          active: { text: "Activa", color: "text-green-700 border-green-300" },
          inactive: { text: "Inactiva", color: "text-red-700 border-red-300" },
          maintenance: {
            text: "En mantenimiento",
            color: "text-yellow-700 border-yellow-300",
          },
        };
        const config = statusConfig[value as keyof typeof statusConfig] ?? {
          text: "Desconocido",
          color: "bg-gray-100 text-gray-700 border-gray-300",
        };
        return (
          <Badge variant="outline" className={`border ${config.color}`}>
            {config.text}
          </Badge>
        );
      },
    },
    { header: "Ultimo Acceso", accessor: "uacceso" },
  ];

  return (
    <>
      <DataTable<Users>
        columns={columns}
        data={UsersData}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        enableFilters
        actions={(row) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              title="Editar Usuario"
              onClick={() => handleEditUser(row)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Ver Detalles"
              onClick={() => handleViewDetails(row)}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </>
  );
}
