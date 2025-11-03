"use client";
import { useState } from "react";
import { Equipment } from "@/models/equipment";
import { EquipmentData } from "./data";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface EquipmentTableProps {
  onView: (equipment: Equipment) => void;
  onEdit: (equipment: Equipment) => void;
}

export default function EquipmentTable({
  onView,
  onEdit,
}: EquipmentTableProps) {
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});

  const handleDelete = (row: Equipment) => {
    console.warn("Equipo Eliminado ", row.id);
    setDeleteRowId(null);
  };

  const columns: Column<Equipment>[] = [
    {
      header: "ID",
      accessor: "id",
      render: (id) => (
        <div className="w-28 truncate" title={id as string}>
          {id as string}
        </div>
      ),
    },
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
            value={inputFilters.search || ""}
            onChange={(e) =>
              setInputFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
        <Select
          value={inputFilters.category || ""}
          onValueChange={(value) =>
            setInputFilters((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cardio">Cardio</SelectItem>
            <SelectItem value="Strength">Fuerza</SelectItem>
            <SelectItem value="FreeWeight">Peso Libre</SelectItem>
            <SelectItem value="Functional">Funcional</SelectItem>
            <SelectItem value="Accessory">Accesorio</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            Descarga
          </Button>
        </div>
      </div>

      <DataTable<Equipment>
        columns={columns}
        data={EquipmentData}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => onView(row) },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => onEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.id && (
              <Alert className="mt-2 w-full max-w-md">
                <AlertTitle className="text-black">
                  Confirmar Eliminación
                </AlertTitle>
                <AlertDescription className="text-gray-900">
                  ¿Estás seguro de que deseas eliminar este equipo? Esta acción
                  no se puede deshacer.
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
