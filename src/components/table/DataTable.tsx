"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
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
import { ArrowUp, ArrowDown } from "lucide-react";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  filterType?: "text" | "select";
  filterOptions?: { label: string; value: string }[];
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  page?: number; // controlado por el padre
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  enableFilters?: boolean;
  enableRowSelection?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  actions,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  enableFilters = false,
  enableRowSelection = true,
}: DataTableProps<T>) {
  // Estado interno híbrido
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

  // Estado para filtros y sorting
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const columnDefs = React.useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.accessor as string,
        header: col.header,
        cell: ({ getValue, row }) =>
          col.render
            ? col.render(getValue() as T[keyof T], row.original)
            : String(getValue() ?? ""),
        filterFn:
          col.filterType === "select"
            ? (row, columnId, filterValue) =>
                String(row.getValue(columnId)) === filterValue
            : col.filterType === "text"
              ? (row, columnId, filterValue) =>
                  String(row.getValue(columnId))
                    .toLowerCase()
                    .includes(String(filterValue).toLowerCase())
              : undefined,
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Slice para paginación
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = startIndex + currentPageSize;
  const pageRows = table.getRowModel().rows.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* FILTROS */}
      {enableFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          {columns
            .filter((col) => col.filterType)
            .map((col) => {
              const column = table.getColumn(col.accessor as string);
              if (!column) {
                return null;
              }

              if (col.filterType === "text") {
                return (
                  <Input
                    key={String(col.accessor)}
                    placeholder={`Filtrar por ${col.header.toLowerCase()}...`}
                    value={(column.getFilterValue() as string) ?? ""}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    className="max-w-xs"
                  />
                );
              }

              if (col.filterType === "select" && col.filterOptions) {
                return (
                  <select
                    key={String(col.accessor)}
                    className="border rounded-md px-2 py-1 text-sm"
                    value={(column.getFilterValue() as string) ?? ""}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {col.filterOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                );
              }

              return null;
            })}
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
            {actions && <TableHead>Acciones</TableHead>}
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
                {actions && <TableCell>{actions(row.original)}</TableCell>}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (actions ? 1 : 0) +
                  (enableRowSelection ? 1 : 0)
                }
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
        totalPages={Math.ceil(data.length / currentPageSize)}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
