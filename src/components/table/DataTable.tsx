"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { PaginationControls } from "./PaginationControls";
import { Input } from "../Input";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { debounce } from "@/utils";
import { Button } from "../ui/button";
import { deleteBranch } from "@/services/branches";
import { toast } from "sonner";

/* ────────────────────────────────
   🔹 Tipos
──────────────────────────────── */
export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  filterType?: "text" | "select";
  filterOptions?: { label: string; value: string }[];
};

export type FilterChangeHandler = (
  key: string,
  value: string | undefined,
) => void;

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  enableFilters?: boolean;
  enableRowSelection?: boolean;
  totalPages?: number;
  onFilterChange?: FilterChangeHandler;
  filterValues?: Record<string, string | undefined>;
};

/* ────────────────────────────────
   🔹 Input de filtro optimizado
──────────────────────────────── */
function TextFilterInput({
  columnKey,
  label,
  value,
  onDebouncedChange,
}: {
  columnKey: string;
  label: string;
  value?: string;
  onDebouncedChange: (key: string, value: string | undefined) => void;
}) {
  const [localValue, setLocalValue] = React.useState(value ?? "");

  React.useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const debouncedChange = React.useMemo(
    () =>
      debounce((val: string) => {
        onDebouncedChange(columnKey, val || undefined);
      }, 500),
    [columnKey, onDebouncedChange],
  );

  return (
    <Input
      placeholder={`Filtrar por ${label.toLowerCase()}...`}
      value={localValue}
      onChange={(e) => {
        const val = e.target.value;
        setLocalValue(val);
        debouncedChange(val);
      }}
      className="max-w-xs"
    />
  );
}

/* ────────────────────────────────
   🔹 DataTable principal
──────────────────────────────── */
export function DataTable<T extends { id: string }>({
  columns,
  data,
  actions,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalPages,
  enableFilters = false,
  enableRowSelection = true,
  onFilterChange,
  filterValues,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalPageSize, setInternalPageSize] = React.useState(10);

  const currentPage = page ?? internalPage;
  const currentPageSize = pageSize ?? internalPageSize;

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
    }
  };

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Columnas configuradas
  const columnDefs = React.useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.accessor as string,
        header: col.header,
        cell: ({ getValue, row }) => {
          const value = getValue() as T[keyof T];
          const originalRow = row.original;
          return col.render
            ? col.render(value, originalRow)
            : String(value ?? "");
        },
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const debouncedOnFilterChange = React.useCallback(
    debounce((key: string, value: string | undefined) => {
      onFilterChange?.(key, value);
    }, 500),
    [onFilterChange],
  );

  const pageRows = table.getRowModel().rows;

  /* ────────────────────────────────
     🔹 Eliminar sucursal y refrescar
  ───────────────────────────────── */
  const handleDelete = async (row: T) => {
    const name = (row as any).name ?? "esta sucursal";
    const confirmed = window.confirm(`¿Seguro que deseas eliminar ${name}?`);
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token no encontrado");
      }

      await deleteBranch(row.id, token);
      toast.success("Sucursal eliminada correctamente ✅");

      // 🔄 Refrescar la página completamente (como F5)
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar la sucursal ❌");
    }
  };

  /* ────────────────────────────────
     🔹 Render principal
  ───────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* FILTROS */}
      {enableFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          {columns
            .filter((col) => col.filterType)
            .map((col) => (
              <TextFilterInput
                key={String(col.accessor)}
                columnKey={col.accessor as string}
                label={col.header}
                value={filterValues?.[col.accessor as string]}
                onDebouncedChange={debouncedOnFilterChange}
              />
            ))}
        </div>
      )}

      {/* TABLA */}
      <Table>
        <TableHeader>
          <TableRow>
            {enableRowSelection && (
              <TableHead className="w-[35px]">
                <Checkbox />
              </TableHead>
            )}
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none"
                >
                  <span className="inline-flex items-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() === "asc" && (
                      <ArrowUp className="ml-1 h-4 w-4 inline" />
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <ArrowDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </span>
                </TableHead>
              )),
            )}
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageRows.length ? (
            pageRows.map((row) => (
              <TableRow key={row.id}>
                {enableRowSelection && (
                  <TableCell className="w-[35px]">
                    <Checkbox />
                  </TableCell>
                )}
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}

                <TableCell className="flex justify-end gap-2">
                  {actions && actions(row.original)}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(row.original)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1 + (enableRowSelection ? 1 : 0)}
                className="text-center py-6 text-muted-foreground"
              >
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* PAGINACIÓN */}
      <PaginationControls
        page={currentPage}
        totalPages={totalPages ?? Math.ceil(data.length / currentPageSize)}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
