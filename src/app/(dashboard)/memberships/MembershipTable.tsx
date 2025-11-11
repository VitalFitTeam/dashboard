"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter } from "next/navigation";
import { MembershipType } from "@vitalfit/sdk";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Notification } from "@/components/ui/Notification"; // Asegúrate de importar el componente Notification

interface MembershipTableProps {
  data: MembershipType[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; category: string };
  onFilterChange: (filters: { search?: string; category?: string }) => void;
}

interface MembershipRow {
  membership_type_id: string;
  name: string;
}

export default function MembershipTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: MembershipTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.category || "all");
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput.trim() === "") {
        if (filters.search !== "") {
          onFilterChange({ search: "" });
        }
      } else if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (statusFilter !== filters.category) {
      onFilterChange({ category: statusFilter === "all" ? "" : statusFilter });
    }
  }, [statusFilter]);

  const handleView = (row: MembershipRow) => {
    router.push(`/memberships/${row.membership_type_id}`);
  };

  const handleEdit = (row: MembershipRow) => {
    router.push(`/memberships/${row.membership_type_id}/edit`);
  };

  const handleDelete = async (membership: MembershipType) => {
    if (!token) {
      setDeleteRowId(null);
      return;
    }
    try {
      await api.membership.deleteMembershipType(
        membership.membership_type_id,
        token,
      );

      // Mostrar mensaje de éxito
      setShowSuccess(true);

      // Recargar los datos de la tabla
      onReload();

      // Cerrar el diálogo de confirmación
      setDeleteRowId(null);

      // Ocultar automáticamente el mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al eliminar la membresía:", error);
      alert("Error al eliminar la membresía. Inténtelo de nuevo.");
      setDeleteRowId(null);
    }
  };

  const columns: Column<MembershipType>[] = [
    {
      header: "ID",
      accessor: "membership_type_id",
      render: (id) => (
        <div className="w-28 truncate" title={id as string}>
          {id as string}
        </div>
      ),
    },
    { header: "Nombre", accessor: "name", filterType: "text" },
    { header: "Descripcion", accessor: "description", filterType: "text" },
    {
      header: "Duración (días)",
      accessor: "duration_days",
      filterType: "text",
    },
    { header: "Precio", accessor: "price", filterType: "text" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => {
        const statusConfig = {
          Active: { text: "Activa", color: "text-green-700 border-green-300" },
          Inactive: {
            text: "Inactiva",
            color: "text-yellow-700 border-yellow-300",
          },
        };
        const config = statusConfig[value ? "Active" : "Inactive"] ?? {
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
  ];

  return (
    <>
      {/* Notificación de éxito */}
      {showSuccess && (
        <Notification
          variant="success"
          description="Membresía desactivada/eliminada correctamente"
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activa</SelectItem>
            <SelectItem value="inactive">Inactiva</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>

      <DataTable<MembershipType>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="membership_type_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                {
                  label: "Ver Detalles",
                  icon: Eye,
                  onClick: () => handleView(row),
                },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.membership_type_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.membership_type_id && (
              <Alert className="mt-2 w-full max-w-md">
                <AlertTitle className="text-black">
                  Confirmar Eliminación
                </AlertTitle>
                <AlertDescription className="text-gray-900">
                  ¿Estás seguro de que deseas eliminar esta membresía? Esta
                  acción no se puede deshacer.
                </AlertDescription>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="border-white"
                    onClick={() => setDeleteRowId(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    className="text-white"
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                    Eliminar
                  </Button>
                </div>
              </Alert>
            )}
          </div>
        )}
      />
    </>
  );
}
