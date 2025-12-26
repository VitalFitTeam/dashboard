"use client";

import React from "react";
import { DataTable, Column } from "@/components/ui/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Receipt } from "lucide-react";

interface Payment {
  payment_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method_id: string;
  status: string;
  transaction_id: string;
  receipt_url?: string;
}

interface PaymentHistoryTableProps {
  payments: Payment[];
  isLoading?: boolean;
}

export function PaymentHistoryTable({ payments, isLoading }: PaymentHistoryTableProps) {
  
  // Definición de columnas para la tabla de pagos
  const columns: Column<Payment>[] = [
    {
      header: "Fecha de Pago",
      accessor: "payment_date",
      render: (v) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {v ? new Date(v as string).toLocaleDateString() : "—"}
        </div>
      ),
    },
    {
      header: "Método",
      accessor: "payment_method_id",
      render: (v) => (
        <Badge variant="secondary" className="font-normal capitalize px-2 py-0">
          {String(v || "N/A")}
        </Badge>
      ),
    },
    {
      header: "Referencia",
      accessor: "transaction_id",
      render: (v) => (
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-tight">
          {String(v || "—")}
        </span>
      ),
    },
    {
      header: "Monto Pagado",
      accessor: "amount_paid",
      render: (v) => (
        <span className="font-medium text-foreground text-sm">
          ${Number(v).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: "status",
      render: (v) => (
        <Badge 
          variant={v === "Paid" || v === "confirmed" ? "success" : "outline"}
          className="text-[10px] uppercase font-bold"
        >
          {String(v || "Pending")}
        </Badge>
      ),
    },
  ];

  return (
    <div className="rounded-md border bg-card">
      <DataTable
        columns={columns}
        data={payments || []}
        isLoading={isLoading}
        enableRowSelection={false}
        rowIdKey="payment_id"
        actions={(row) => row.receipt_url ? (
          <a 
            href={row.receipt_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs flex items-center gap-1 justify-center"
          >
            <Receipt className="h-3 w-3" />
            Recibo
          </a>
        ) : null}
      />
    </div>
  );
}