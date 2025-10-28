"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { useEffect, useState } from "react";
import { Instructor } from "@/models/instructor";
import { Service } from "@/models/service";
import { Equipment } from "@/models/equipment";
import { PaymentMethodUI } from "./page";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { PaginatedBranch } from "@vitalfit/sdk";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import {
  CopyIcon,
  Download,
  Eye,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { RowActions } from "@/components/ui/table/RowActions";

export type FilterChangeHandler = (
  key: string,
  value: string | undefined,
) => void;

interface BranchesTableProps {
  data: PaginatedBranch[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  allInstructors: Instructor[];
  allServices: Service[];
  allEquipment: Equipment[];
  allPaymentMethods: PaymentMethodUI[];
  totalPages: number;
  onFilterChange: FilterChangeHandler;
  filterValues: Record<string, string | undefined>;
  onBranchDeleted?: () => void | Promise<void>;
}

interface BranchRow {
  branch_id: string;
  name: string;
}

export default function BranchesTable({
  data,
  isLoading,
  onFilterChange,
  filterValues,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: BranchesTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<PaginatedBranch | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});
  const [debouncedFilters, setDebouncedFilters] = useState<
    Record<string, string>
  >({});

  const handleView = (row: BranchRow) => {
    console.log("Ver detalles de la sucursal:", row.branch_id, row.name);
  };

  const handleEdit = (row: BranchRow) => {
    console.log("Editar sucursal:", row.branch_id, row.name);
  };

  const handleDelete = (row: BranchRow) => {
    console.log("Eliminar sucursal:", row.branch_id, row.name);
  };

  const columns: Column<PaginatedBranch>[] = [
    { header: "ID", accessor: "branch_id" },
    {
      accessor: "name",
      header: "Nombre",
    },
    { header: "taxId", accessor: "tax_id" },
    {
      header: "Administrador",
      accessor: "manager_name",
      render: (_, row) => `${row.manager_name} ${row.manager_last_name}`,
    },
    {
      header: "País",
      accessor: "country_name",
    },
    {
      accessor: "status",
      header: "Estado",
      render: (value) => {
        const statusConfig = {
          Active: { text: "Activa", color: "text-green-700 border-green-300" },
          Inactive: {
            text: "Inactiva",
            color: "text-red-700 border-red-300",
          },
          Maintenance: {
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
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputFilters.search) {
        onFilterChange?.("name", inputFilters.search);
        onFilterChange?.("tax_id", inputFilters.search);
      } else {
        onFilterChange?.("name", undefined);
        onFilterChange?.("tax_id", undefined);
      }

      if (inputFilters.status) {
        onFilterChange?.("status", inputFilters.status);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputFilters]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o RIF"
            className="pl-9"
            value={inputFilters.search || ""}
            onChange={(e) =>
              setInputFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
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
            <SelectItem value="Maintenance">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>

        {filterValues.name || filterValues.tax_id || filterValues.status ? (
          <Button
            variant="outline"
            className="mt-2 sm:mt-0 border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              onFilterChange("name", undefined);
              onFilterChange("tax_id", undefined);
              onFilterChange("status", undefined);
              setInputFilters({});
            }}
          >
            Limpiar filtros
          </Button>
        ) : null}

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        totalPages={totalPages}
        rowIdKey="branch_id"
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
