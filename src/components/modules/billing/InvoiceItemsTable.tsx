"use client";

import React from "react";
import { DataTable, Column } from "@/components/ui/table/DataTable";
import { Package, CreditCard as Membership, Wrench as Service } from "lucide-react";
import { InvoiceItemDetail } from "@vitalfit/sdk";

interface InvoiceItemsTableProps {
  items: InvoiceItemDetail[];
  isLoading?: boolean;
}

export function InvoiceItemsTable({ items, isLoading }: InvoiceItemsTableProps) {
  
  const columns: Column<InvoiceItemDetail>[] = [
    {
      header: "Descripción",
      accessor: "invoice_item_id",
      render: (_, row) => {
        // Usamos los campos opcionales de tu tipo
        const isMembership = !!row.membership_type_id;
        const isPackage = !!row.package_id;
        
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {isMembership ? <Membership className="h-4 w-4" /> : isPackage ? <Package className="h-4 w-4" /> : <Service className="h-4 w-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {isMembership ? "Membresía" : isPackage ? "Paquete de Clases" : "Servicio"}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">
                {row.invoice_item_id.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      },
    },
    { 
      header: "Cantidad", 
      accessor: "quantity", 
      render: (v) => <span className="text-sm text-muted-foreground font-medium">x{v as number}</span> 
    },
    { 
      header: "Precio Unit.", 
      accessor: "unit_price", 
      render: (v) => <span className="text-sm">${parseFloat(v as string).toFixed(2)}</span>
    },
    { 
      header: "Impuesto", 
      accessor: "tax_amount", 
      render: (v, row) => (
        <div className="flex flex-col text-[11px]">
          <span className="text-muted-foreground">${parseFloat(v as string).toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground/60">({row.tax_rate}%)</span>
        </div>
      ) 
    },
    { 
      header: "Total", 
      accessor: "total_line", 
      render: (v) => (
        <span className="text-sm font-semibold text-foreground">
          ${parseFloat(v as string).toFixed(2)}
        </span>
      ) 
    },
  ];

  return (
    <div className="rounded-md border bg-card">
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