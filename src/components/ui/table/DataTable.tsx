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

import { PaginationControls } from "./PaginationControls";
import { Input } from "../Input";
import { ArrowUp, ArrowDown } from "lucide-react";
import { debounce } from "@/utils";
import { Checkbox } from "../checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

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
  rowIdKey?: keyof T;
};

function TextFilterInput({
  columnKey,
  label,
  value,
  onFilterChange,
}: {
  columnKey: string;
  label: string;
  value?: string;
  onFilterChange: FilterChangeHandler;
}) {
  const [localValue, setLocalValue] = React.useState(value ?? "");

  React.useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const debouncedChange = React.useMemo(
    () =>
      debounce((val: string) => {
        onFilterChange(columnKey, val || undefined);
      }, 500),
    [columnKey, onFilterChange],
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

export function DataTable<T extends object>({
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
  rowIdKey = "id" as keyof T,
}: DataTableProps<T>) {
  // Paginación interna
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalPageSize, setInternalPageSize] = React.useState(10);

  const currentPage = page ?? internalPage;
  const currentPageSize = pageSize ?? internalPageSize;

  const handlePageChange = (newPage: number) => {
    onPageChange ? onPageChange(newPage) : setInternalPage(newPage)
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
    }
  };

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const columnDefs = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            aria-label="Seleccionar todas las filas"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    cols.push(
      ...columns.map((col) => ({
        accessorKey: col.accessor as string,
        header: col.header,
        cell: ({ getValue, row }: { getValue: any; row: any }) => {
          const value = getValue() as T[keyof T];
          const originalRow = row.original;
          return col.render
            ? col.render(value, originalRow)
            : String(value ?? "");
        },
      })),
    );

    if (actions) {
      cols.push({
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">{actions(row.original)}</div>
        ),
      });
    }

    return cols;
  }, [columns, actions, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (originalRow) => originalRow[rowIdKey] as string,
  });

  const pageRows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
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
                onFilterChange={onFilterChange!}
              />
            ))}
        </div>
      )}

      <Table className="w-full table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
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
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {pageRows.length ? (
            pageRows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnDefs.length}
                className="text-center py-6 text-muted-foreground"
              >
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationControls
        page={currentPage}
        totalPages={totalPages ?? Math.ceil(data.length / currentPageSize)}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
