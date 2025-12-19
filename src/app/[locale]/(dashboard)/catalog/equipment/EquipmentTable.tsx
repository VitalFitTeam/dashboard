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
import { Equipment, EquipmentCategory } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";

interface EquipmentTableProps {
  data: Equipment[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search?: string; category?: EquipmentCategory }; 
  onFilterChange: (filters: { search?: string; category?: EquipmentCategory }) => void;
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

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { token } = useAuth();
  const router = useRouter();


  useEffect(() => {
    console.log("DEBUG TABLE: La prop 'page' ahora es:", page);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleView = (row: EquipmentRow) => {
    router.push(`/equipment/${row.equipment_id}`);
  };

  const handleEdit = (row: EquipmentRow) => {
    router.push(`/equipment/${row.equipment_id}/edit`);
  };

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (!token){
      return;
    }
    try {
      await api.equipment.deleteEquipment(equipment.equipment_id, token);
      setShowSuccess(true);
      onReload(); 
    } catch (error) {
      setDeleteError("Error al eliminar el equipamiento.");
    } finally {
      setDeleteRowId(null);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const columns: Column<Equipment>[] = [
    { header: "Equipamiento", accessor: "name" },
    { header: "Categoría", accessor: "category" },
    { header: "Modelo", accessor: "model" },
    { header: "Marca", accessor: "brand" },
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
          value={filters.category || "all"}
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              category: value === "all" ? undefined : (value as EquipmentCategory) 
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Descarga
        </Button>
      </div>

      <DataTable<Equipment>
        key={`table-page-${page}`}
        columns={columns}
        data={data}
        page={page} 
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="equipment_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => router.push(`/equipment/${row.equipment_id}`) },
                { label: "Modificar", icon: Pencil, onClick: () => router.push(`/equipment/${row.equipment_id}/edit`) },
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
                open={true}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                title="Confirmar eliminación"
                description={`¿Estás seguro de que deseas eliminar "${row.name}"?`}
                actionText="Eliminar"
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