"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export const DataTable = <T,>({ columns, data }: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = React.useState<number[]>([]);

  const allSelected = selectedRows.length === data.length && data.length > 0;
  const partiallySelected =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const toggleSelectAll = () => {
    setSelectedRows(allSelected ? [] : data.map((_, i) => i));
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {/* Checkbox de encabezado */}
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>

            {columns.map((col) => (
              <TableHead key={String(col.accessor)}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={i}
              data-state={selectedRows.includes(i) ? "selected" : undefined}
              className="transition-colors hover:bg-muted/50"
            >
              {/* Checkbox por fila */}
              <TableCell className="w-[40px]">
                <Checkbox
                  checked={selectedRows.includes(i)}
                  onCheckedChange={() => toggleRow(i)}
                />
              </TableCell>

              {columns.map((col, colIndex) => {
                const value = row[col.accessor];
                const content = col.render
                  ? col.render(value, row)
                  : (value as React.ReactNode);

                return <TableCell key={colIndex}>{content}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
