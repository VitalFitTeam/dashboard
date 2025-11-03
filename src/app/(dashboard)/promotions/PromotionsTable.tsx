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
  SelectValue,
} from "@/components/ui/select";
import { Download, Eye, Pencil, Trash2, Search } from "lucide-react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";

// Tipos de datos para promociones
export interface Promotion {
  promotion_id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount";
  discount: number;
  min_amount?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  status: "Active" | "Inactive" | "Expired";
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionDTO {
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount";
  discount: number;
  min_amount?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
}

export interface UpdatePromotionDTO extends Partial<CreatePromotionDTO> {
  status?: "Active" | "Inactive";
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
  onEdit?: (promotion: Promotion) => void;
  onDelete?: (promotion: Promotion) => void;
  onView?: (promotion: Promotion) => void;
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
  onEdit,
  onDelete,
  onView,
}: PromotionsTableProps) {
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});

  // Acciones de la tabla
  const handleView = (row: Promotion) => {
    onView?.(row);
  };

  const handleEdit = (row: Promotion) => {
    onEdit?.(row);
  };

  const handleDelete = (row: Promotion) => {
    onDelete?.(row);
  };

  // Función para formatear el descuento
  const formatDiscount = (promotion: Promotion) => {
    if (promotion.type === "percentage") {
      return `${promotion.discount}%`;
    } else {
      return `$${promotion.discount.toFixed(2)}`;
    }
  };

  // Definición de columnas
  const columns: Column<Promotion>[] = [
    { header: "Código", accessor: "code" },
    { header: "Nombre", accessor: "name" },
    {
      header: "Tipo",
      accessor: "type",
      render: (value) => (value === "percentage" ? "Porcentaje" : "Monto Fijo"),
    },
    {
      header: "Descuento",
      accessor: "discount",
      render: (value, row) => formatDiscount(row),
    },
    {
      header: "Fecha de inicio",
      accessor: "start_date",
      render: (value) => {
        if (!value) {return "-";}
        const date = new Date(value);
        if (isNaN(date.getTime())) {return "Fecha inválida";}
        return date.toLocaleDateString("es-VE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Fecha de finalización",
      accessor: "end_date",
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
          Active: {
            text: "Activa",
            color: "text-green-700 border-green-300 bg-green-50",
          },
          Inactive: {
            text: "Inactiva",
            color: "text-red-700 border-red-300 bg-red-50",
          },
          Expired: {
            text: "Expirada",
            color: "text-yellow-700 border-yellow-300 bg-yellow-50",
          },
        };
        const config = statusConfig[value as keyof typeof statusConfig] ?? {
          text: "Desconocido",
          color: "text-gray-700 border-gray-300 bg-gray-50",
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
        onFilterChange?.("search", inputFilters.search);
      } else {
        onFilterChange?.("search", undefined);
      }

      if (inputFilters.status) {
        onFilterChange?.("status", inputFilters.status);
      }

      if (inputFilters.dateRange) {
        onFilterChange?.("dateRange", inputFilters.dateRange);
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
            placeholder="Buscar por nombre o código"
            className="pl-9 w-90"
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
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Activa</SelectItem>
            <SelectItem value="Inactive">Inactiva</SelectItem>
            <SelectItem value="Expired">Expirada</SelectItem>
          </SelectContent>
        </Select>

        {/* Fecha de finalización */}
        <Select
          value={inputFilters.dateRange || ""}
          onValueChange={(value) =>
            setInputFilters((prev) => ({ ...prev, dateRange: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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
        {(filterValues.search ||
          filterValues.status ||
          filterValues.dateRange) && (
          <Button
            variant="outline"
            className="mt-2 sm:mt-0"
            onClick={() => {
              onFilterChange("search", undefined);
              onFilterChange("status", undefined);
              onFilterChange("dateRange", undefined);
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
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        totalPages={totalPages}
        rowIdKey="promotion_id"
        actions={(row) => (
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
