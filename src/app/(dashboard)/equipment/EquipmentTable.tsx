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
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Equipment } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";

interface EquipmentTableProps {
  data: Equipment[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; category: string };
  onFilterChange: (filters: { search?: string; category?: string }) => void;
}

interface EquipmentRow {
  equipment_id: string;
  name: string;
}

export default function EquipmentTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: EquipmentTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

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

  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const handleView = (row: EquipmentRow) => {
    console.log("Ver detalles de:", row.equipment_id);
    router.push(`/equipment/${row.equipment_id}`);
  };

  const handleEdit = (row: EquipmentRow) => {
    router.push(`/equipment/${row.equipment_id}/edit`);
  };

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (!token) {
      alert("Error: Sesión no autenticada.");
      setDeleteRowId(null);
      return;
    }
    try {
      await api.equipment.deleteEquipment(equipment.equipment_id, token);
      onReload();
      setDeleteRowId(null);
    } catch (error) {
      console.error("Error al eliminar el equipo:", error);
      setDeleteRowId(null);
    }
  };

  const columns: Column<Equipment>[] = [
    { header: "Equipamiento", accessor: "name", filterType: "text" },
    { header: "Categoría", accessor: "category", filterType: "text" },
    { header: "Modelo", accessor: "model", filterType: "text" },
    { header: "Marca", accessor: "brand", filterType: "text" },
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
          <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            <SelectItem value="Cardio">Cardio</SelectItem>
            <SelectItem value="Strength">Strength</SelectItem>
            <SelectItem value="FreeWeight">FreeWeight</SelectItem>
            <SelectItem value="Functional">Functional</SelectItem>
            <SelectItem value="Accessory">Accesorio</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descarga
          </Button>
        </div>
      </div>

      <DataTable<Equipment>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="equipment_id"
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
                  onClick: () => setDeleteRowId(row.equipment_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.equipment_id && (
              <GeneralAlertDialog
                open={deleteRowId === row.equipment_id}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeleteEquipment(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />
    </>
  );
}
