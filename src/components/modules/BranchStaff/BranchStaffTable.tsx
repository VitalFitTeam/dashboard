"use client";

import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Staff } from "@vitalfit/sdk";

import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface BranchStaffTableProps {
  data: (Staff & { isPending?: boolean })[];
  isLoading?: boolean;
  onRemove: (id: string, isPending?: boolean) => void;
}

export default function BranchStaffTable({
  data,
  isLoading,
  onRemove,
}: BranchStaffTableProps) {

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const columns = useMemo<Column<Staff & { isPending?: boolean }>[]>(() => [
    {
      header: "Empleado",
      accessor: "first_name",
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {row.first_name} {row.last_name}
              </span>
              {row.isPending && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider">
                  Pendiente
                </Badge>
              )}
            </div>
            <span className="text-xs text-slate-500 truncate block">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Rol",
      accessor: "role",
      render: (value) => (
        <div className="text-left">
          <Badge variant="secondary" className="capitalize text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            {String(value || "staff").replace("_", " ")}
          </Badge>
        </div>
      ),
    },
  ], []);

  return (
    <Card className="rounded-xl shadow-sm border overflow-hidden bg-white">
      <DataTable
        columns={columns}
        data={paginatedData} 
        isLoading={isLoading}
        rowIdKey="user_id"
        page={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(newPage) => setCurrentPage(newPage)}
        enableRowSelection={false}
        actions={(row) => (
          <div className="flex justify-end pr-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => onRemove(row.user_id, row.isPending)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      />
      <div className="px-6 py-3 bg-slate-50/50 border-t text-[11px] text-slate-400 font-medium italic">
        Mostrando {paginatedData.length} de {data.length} empleados totales
      </div>
    </Card>
  );
}