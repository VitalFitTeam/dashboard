"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Notification } from "@/components/ui/Notification";
import { Cause, mockCauses } from "./data";
import { Badge } from "@/components/ui/badge"; // Importar el componente Badge

interface CausesTableProps {
  data: Cause[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; category: string };
  onFilterChange: (filters: { search?: string; category?: string }) => void;
}

export default function CausesTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: CausesTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
  }, [searchInput, filters.search, onFilterChange]);

  const handleView = (row: Cause) => {
    router.push(`/causes/${row.causes_id}`);
  };

  const handleEdit = (row: Cause) => {
    router.push(`/causes/${row.causes_id}/edit`);
  };

  const handleDeleteCause = async (cause: Cause) => {
    try {
      console.log("Eliminando causa:", cause);
      
      // Simulación de eliminación
      setShowSuccess(true);
      setDeleteRowId(null);
      onReload();
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setDeleteError("Error al eliminar la causa");
      setTimeout(() => setDeleteError(null), 3000);
    }
  };


  const StatusBadge = ({ status }: { status: "active" | "inactive" }) => {
    const variantMap = {
      active: "secondary", 
      inactive: "destructive" 
    };

    const labels = {
      active: "Activo",
      inactive: "Inactivo"
    };

    return (
      <Badge variant={variantMap[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  const columns: Column<Cause>[] = [
    { header: "Nombre de la causal", accessor: "name", filterType: "text" },
    { header: "Descripción", accessor: "description", filterType: "text" },
    { 
      header: "Estado", 
      accessor: "status", 
      filterType: "text",
      render: (value) => <StatusBadge status={value as "active" | "inactive"} />
    },
  ];

  return (
    <>
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

        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ category: value })}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>

      {/* Notificaciones */}
      {showSuccess && (
        <Notification
          variant="success"
          description="Causa eliminada correctamente"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {deleteError && (
        <Notification
          variant="destructive"
          description={deleteError}
          onClose={() => setDeleteError(null)}
        />
      )}

      <DataTable<Cause>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="causes_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => handleView(row) },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.causes_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />

            {deleteRowId === row.causes_id && (
              <GeneralAlertDialog
                open={true}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar esta causa? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeleteCause(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />
    </>
  );
}