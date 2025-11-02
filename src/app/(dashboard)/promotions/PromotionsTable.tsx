"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Download, Eye, Pencil, Trash2, Search } from "lucide-react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";

// Tipo de datos para una promoción (ajústalo según tu API)
export interface Promotion {
  promotion_id: string;
  code: string;
  name: string;
  type: string;
  discount: string;
  end_date: string;
  status: "Active" | "Inactive" | "Expired";
}

// Props del componente
interface PromotionsTableProps {
  data: Promotion[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFilterChange: (key: string, value: string | undefined) => void;
  filterValues: Record<string, string | undefined>;
}

export default function PromotionsTable({
  data,
  isLoading,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  filterValues,
}: PromotionsTableProps) {
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});

  // Acciones de la tabla
  const handleView = (row: Promotion) => {
    console.log("Ver promoción:", row.code);
  };

  const handleEdit = (row: Promotion) => {
    console.log("Editar promoción:", row.code);
  };

  const handleDelete = (row: Promotion) => {
    console.log("Eliminar promoción:", row.code);
  };

  // Definición de columnas
  const columns: Column<Promotion>[] = [
    { header: "Código", accessor: "code" },
    { header: "Nombre", accessor: "name" },
    { header: "Tipo", accessor: "type" },
    { header: "Descuento", accessor: "discount" },
    {
      header: "Fecha de finalización",
      accessor: "endDate",
      render: (value) => {
        if (!value) {return "-";}
        const date = new Date(value);
        if (isNaN(date.getTime())) {return "Sin fecha";}
        return date.toLocaleDateString("es-VE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Estatus",
      accessor: "status",
      render: (value) => {
        const statusConfig = {
          Active: { text: "Activa", color: "text-green-700 border-green-300" },
          Inactive: { text: "Inactiva", color: "text-red-700 border-red-300" },
          Expired: {
            text: "Expirada",
            color: "text-yellow-700 border-yellow-300",
          },
        };
        const config = statusConfig[value as keyof typeof statusConfig] ?? {
          text: "Desconocido",
          color: "text-gray-700 border-gray-300",
        };
        return (
          <Badge variant="outline" className={`border ${config.color}`}>
            {config.text}
          </Badge>
        );
      },
    },
  ];

  // Manejo de filtros con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputFilters.search) {
        onFilterChange?.("name", inputFilters.search);
        onFilterChange?.("code", inputFilters.search);
      } else {
        onFilterChange?.("name", undefined);
        onFilterChange?.("code", undefined);
      }

      if (inputFilters.status) {
        onFilterChange?.("status", inputFilters.status);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputFilters]);

  return (
    <>
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre"
            className="pl-9"
            value={inputFilters.search || ""}
            onChange={(e) =>
              setInputFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        {/* Filtro de estatus */}
        <Select
          value={inputFilters.status || ""}
          onValueChange={(value) =>
            setInputFilters((prev) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Activa</SelectItem>
            <SelectItem value="Inactive">Inactiva</SelectItem>
            <SelectItem value="Expired">Expirada</SelectItem>
          </SelectContent>
        </Select>

        {/* 🗓️ Fecha de finalización */}
        <Select
          value={inputFilters.dateRange || ""}
          onValueChange={(value) =>
            setInputFilters((prev) => ({ ...prev, dateRange: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Fecha de finalización" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Este mes</SelectItem>
            <SelectItem value="next_month">Próximo mes</SelectItem>
            <SelectItem value="next_3_months">Próximos 3 meses</SelectItem>
            <SelectItem value="expired">Ya expiradas</SelectItem>
          </SelectContent>
        </Select>

        {/* Limpiar filtros */}
        {(filterValues.name || filterValues.code || filterValues.status) && (
          <Button
            variant="outline"
            className="mt-2 sm:mt-0 border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              onFilterChange("name", undefined);
              onFilterChange("code", undefined);
              onFilterChange("status", undefined);
              setInputFilters({});
            }}
          >
            Limpiar filtros
          </Button>
        )}

        {/* Botón extra*/}
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar CSV
          </Button>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        columns={columns}
        data={data}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        rowIdKey="promotion_id"
        actions={(row) => (
          <RowActions
            actions={[
              { label: "Ver", icon: Eye, onClick: () => handleView(row) },
              { label: "Editar", icon: Pencil, onClick: () => handleEdit(row) },
              {
                label: "Eliminar",
                icon: Trash2,
                onClick: () => handleDelete(row),
                variant: "danger",
                separatorBefore: true,
              },
            ]}
          />
        )}
      />
    </>
  );
}
