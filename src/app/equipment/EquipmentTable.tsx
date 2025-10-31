"use client";
import { Button } from "@/components/ui/button";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import Trash from "@heroicons/react/24/outline/TrashIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { useState } from "react";
import { Equipment } from "@/models/equipment";
import { EquipmentData } from "./data";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import EllipsisVerticalIcon from "@heroicons/react/24/outline/EllipsisVerticalIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

export default function EquipmentTable() {
  const [page, setPage] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    console.warn("editar equipo", selectedEquipment);
  };

  const handleViewDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    console.warn("ver detalles", selectedEquipment);
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
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" title="Acciones">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(row)}>
                    <EyeIcon className="h-4 w-4" />
                    <span className="ml-2">Ver Detalles</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditEquipment(row)}>
                    <PencilIcon className="h-4 w-4" />
                    <span className="ml-2">Modificar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteRowId(row.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                    <span className="ml-2 text-red-500">Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    onClick={() => {
                      console.warn("Equipo Eliminado ", row.id);
                    }}
                  >
                    <Trash className="h-4 w-4 text-white" />
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
