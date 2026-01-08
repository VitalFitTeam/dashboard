"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { toast } from "sonner";
import { User } from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter } from "@/i18n/navigation";


const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  branch_admin: "Admin de Sede",
  instructor: "Instructor",
  accountant: "Contador",
  data_analyst: "Analista de Datos",
  recepcionist: "Recepcionista",
};

export type UserTableProps = {
  data: User[];
  isLoading: boolean;
  onReload: () => void;
  filters: { search?: string; role?: string };
  onFilterChange: (filters: { search?: string; role?: string }) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function UsersTable({
  data,
  isLoading,
  onReload,
  filters,
  onFilterChange,
  page,
  totalPages,
  onPageChange,
}: UserTableProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleDeleteUser = async () => {
    if (!token || !deleteRowId) {
      return;
    }
    const toastId = toast.loading("Eliminando usuario...");

    try {
      await api.user.deleteUser(deleteRowId, token);
      toast.success("Usuario eliminado", {
        id: toastId,
        description: "El registro ha sido borrado correctamente.",
      });
      onReload();
    } catch (error) {
      toast.error("Error", {
        id: toastId,
        description: "No se pudo eliminar el usuario.",
      });
    } finally {
      setDeleteRowId(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: "Nombre",
      accessor: "first_name",
      render: (_, row) => `${row.first_name} ${row.last_name}`,
    },
    { header: "Email", accessor: "email" },
    { 
      header: "Rol", 
      accessor: "role_name" as keyof User,
      render: (value) => (
        <Badge variant="secondary" className="font-normal">
          {ROLE_LABELS[String(value)] || String(value)}
        </Badge>
      )
    },
    {
      header: "Status",
      accessor: "is_validated",
      render: (value) =>
        value ? (
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Activo</Badge>
        ) : (
          <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">Inactivo</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full sm:w-[350px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido o email..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <Select
            value={filters.role || "all"}
            onValueChange={(value) =>
              onFilterChange({ ...filters, role: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="branch_admin">Admin de Sede</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="accountant">Contador</SelectItem>
              <SelectItem value="data_analyst">Analista de Datos</SelectItem>
              <SelectItem value="recepcionist">Recepcionista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={() => toast.info("Función de exportación en desarrollo")}>
          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <DataTable<User>
        key={`users-table-page-${page}`}
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowIdKey="user_id"
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        actions={(row) => (
          <RowActions
            actions={[
              { label: "Ver Detalles", icon: Eye, onClick: () => router.push(`/users/users/${row.user_id}`) },
              { label: "Modificar", icon: Pencil, onClick: () => router.push(`/users/users/${row.user_id}/edit`) },
              {
                label: "Eliminar",
                icon: Trash2,
                onClick: () => setDeleteRowId(row.user_id),
                variant: "danger",
                separatorBefore: true,
              },
            ]}
          />
        )}
      />

      <GeneralAlertDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title="¿Estás seguro?"
        description="Esta acción eliminará al usuario permanentemente."
        actionText="Eliminar"
        onAction={handleDeleteUser}
        actionVariant="destructive"
      />
    </div>
  );
}