"use client";

import React from "react";
import { DataTable, Column } from "@/components/ui/table/DataTable";
import { InvoiceItemDetail } from "@vitalfit/sdk";
import { ItemNameCell } from "./ItemNameCell";

interface InvoiceItemsTableProps {
  items: InvoiceItemDetail[];
  isLoading?: boolean;
}

export function InvoiceItemsTable({ items, isLoading }: InvoiceItemsTableProps) {
  
  const columns: Column<InvoiceItemDetail>[] = [
    {
      header: "Descripción",
      accessor: "invoice_item_id", 
      // Cambiamos el argumento para recibir (value, row) en lugar de intentar desestructurar
      render: (_, row) => {
        // 'row' es el objeto completo de tipo InvoiceItemDetail
        return <ItemNameCell item={row} />;
      },
    },
    { 
      header: "Cantidad", 
      accessor: "quantity", 
      render: (v) => (
        <span className="text-sm text-muted-foreground font-medium">
          x{v as number}
        </span>
      ) 
    },
    { 
      header: "Precio Unit.", 
      accessor: "unit_price", 
      render: (v) => (
        <span className="text-sm font-mono">
          ${parseFloat(v as string || "0").toFixed(2)}
        </span>
      )
    },
    { 
      header: "Impuesto", 
      accessor: "tax_amount", 
      render: (v, row) => {
        // Calculamos el porcentaje basándonos en el tax_rate de la fila
        const ratePercentage = (parseFloat(row.tax_rate || "0") * 100).toFixed(0);
        return (
          <div className="flex flex-col text-[11px]">
            <span className="text-muted-foreground font-mono">
              ${parseFloat(v as string || "0").toFixed(2)}
            </span>
            <span className="text-[10px] text-muted-foreground/60 italic">
              ({ratePercentage}%)
            </span>
          </div>
        );
      } 
    },
    { 
      header: "Total", 
      accessor: "total_line", 
      render: (v) => (
        <span className="text-sm font-bold text-foreground font-mono">
          ${parseFloat(v as string || "0").toFixed(2)}
        </span>
      ) 
    },
  ];

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <DataTable
        columns={columns}
        data={items || []}
        isLoading={isLoading}
        enableRowSelection={false}
        rowIdKey="invoice_item_id"
      />
    </div>
  );
}