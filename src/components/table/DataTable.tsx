"use client";
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
import { useState } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
};
export function DataTable<T>({
  columns,
  data,
  actions,
  page,
  pageSize,
  onPageChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  //Paginacion
  const currentPage = page ?? 1;
  const rowsPerPage = pageSize ?? 10;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageData = data.slice(startIndex, endIndex);

  //checkbox
  const allPageSelected = pageData.every((_, i) =>
    selectedRows.includes(startIndex + i),
  );

  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedRows((prev) =>
        prev.filter((i) => i < startIndex || i >= endIndex),
      );
    } else {
      setSelectedRows((prev) => [
        ...prev,
        ...pageData
          .map((_, i) => startIndex + i)
          .filter((i) => !prev.includes(i)),
      ]);
    }
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
            <TableHead className="w-[35px]">
              <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} />
            </TableHead>
            {columns.map((col) => (
              <TableHead key={String(col.accessor)}>{col.header}</TableHead>
            ))}
            {actions && <TableHead>Acciones</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageData.map((row, index) => (
            <TableRow key={startIndex + index}>
              <TableCell className="w-[35px]">
                <Checkbox
                  checked={selectedRows.includes(startIndex + index)}
                  onCheckedChange={() => toggleRow(startIndex + index)}
                />
              </TableCell>
              {columns.map((col, colIndex) => {
                const value = row[col.accessor];
                return (
                  <TableCell key={colIndex}>
                    {col.render ? col.render(value, row) : String(value)}
                  </TableCell>
                );
              })}
              {actions && <TableCell>{actions(row)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {onPageChange && page && pageSize && (
        <PaginationControls
          page={currentPage}
          totalPages={Math.ceil(data.length / rowsPerPage)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
