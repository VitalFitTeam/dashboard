"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { useState } from "react";
import { Users } from "@/models/users";
import { UsersData } from "./data";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { deleteBranch } from "@/services/branches";
import { Trash2 } from "lucide-react";

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);

  const handleEditUser = (user: Users) => {
    setSelectedUser(user);
    alert("Editar detalles del usuario");
  };
  const handleViewDetails = (user: Users) => {
    setSelectedUser(user);
    alert("Ver detalles del usuario");
  };

  /*const handleDeleteBranch = async (branch: Branch) => { // 'Branch' es tu tipo de dato
    const confirmed = window.confirm(`¿Seguro que deseas eliminar la sucursal "${branch.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Error de autenticación. Intenta iniciar sesión de nuevo.");
        return;
      }

      await deleteBranch(branch.id, token);
      to.success("Sucursal eliminada correctamente ✅");

      // ✅ Usa el router de Next.js para refrescar la data sin recargar
      router.refresh(); 

    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar la sucursal ❌");
    }
  };*/

  const columns: Column<Users>[] = [
    {
      header: "ID",
      accessor: "id",
      render: (id) => (
        <div className="w-28 truncate" title={id as string}>
          {id as string}
        </div>
      ),
    },
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
            <Button
              variant="destructive"
              size="icon"
              title="Eliminar Sucursal"
              //onClick={() => handleDeleteBranch(row)}
            >
              <Trash2 className="text-white" />
            </Button>
          </div>
        )}
      />
    </>
  );
}
