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
  type Row,
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
import { ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "../Input";

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
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  enableFilters?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  actions,
  page = 1,
  pageSize = 10,
  onPageChange,
  enableFilters = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const exactMatchFilter = (
    row: Row<T>,
    columnId: string,
    filterValue: string,
  ) => String(row.getValue(columnId)) === filterValue;

  const columnDefs = React.useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.accessor as string,
        header: col.header,
        cell: ({ getValue, row }) =>
          col.render
            ? col.render(getValue() as T[keyof T], row.original)
            : String(getValue() ?? ""),
        // Aquí usamos directamente la función en vez de un string
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
    filterFns: {
      exactMatch: (row, columnId, filterValue) =>
        String(row.getValue(columnId)) === filterValue,
      includesString: (row, columnId, filterValue) =>
        String(row.getValue(columnId))
          .toLowerCase()
          .includes(String(filterValue).toLowerCase()),
    },
  });

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageRows = table.getRowModel().rows.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {enableFilters && (
        <div className="flex gap-3 mb-4">
          {columns.map((col) => {
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
                  onChange={(e) => {
                    column.setFilterValue(e.target.value);
                  }}
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35px]">
              <Checkbox />
            </TableHead>
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
                <TableCell className="w-[35px]">
                  <Checkbox />
                </TableCell>
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
                colSpan={columns.length + (actions ? 2 : 1)}
                className="text-center py-6 text-muted-foreground"
              >
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {onPageChange && (
        <PaginationControls
          page={page}
          totalPages={Math.ceil(data.length / pageSize)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
