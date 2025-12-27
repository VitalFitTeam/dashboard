"use client";

import React from "react";
import { DataTable, Column } from "@/components/ui/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Receipt, 
  ExternalLink 
} from "lucide-react";
import { PaymentMethodCell } from "./PaymentMethodCell";
import { Button } from "@/components/ui/button";
import { useUpdatePaymentStatus } from "@/hooks/billing/useUpdatePaymentStatus";
import { useAuth } from "@/context/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  onRefresh: () => void;
}

export function PaymentHistoryTable({ payments, isLoading, onRefresh }: PaymentHistoryTableProps) {
  const { token } = useAuth();
  const { updateStatus, loading: isUpdating } = useUpdatePaymentStatus();

  const handleConfirm = async (id: string) => {
    if (!token) return;
    const result = await updateStatus(id, "Completed", token);
    if (result.success) onRefresh();
  };

  const columns: Column<Payment>[] = [
    {
      header: "Fecha",
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
      render: (v) => <PaymentMethodCell methodId={String(v)} />,
    },
    {
      header: "Referencia",
      accessor: "transaction_id",
      render: (v) => (
        <span className="text-[11px] font-mono text-muted-foreground uppercase">
          {String(v || "—")}
        </span>
      ),
    },
    {
      header: "Monto",
      accessor: "amount_paid",
      render: (v) => <span className="font-semibold text-sm">${Number(v).toFixed(2)}</span>,
    },
    {
      header: "Estado",
      accessor: "status",
      render: (v) => {
        const isCompleted = v === "Paid" || v === "confirmed" || v === "Completed";
        return (
          <Badge 
            variant={isCompleted ? "success" : "outline"}
            className="text-[10px] uppercase font-bold"
          >
            {isCompleted ? "Completado" : "Pendiente"}
          </Badge>
        );
      },
    },
    {
      header: "Acciones",
      accessor: "payment_id",
      render: (_, row) => {
        const isPending = row.status !== "Completed" && row.status !== "Paid";
        const hasReceipt = row.receipt_url && row.receipt_url !== "Pago reportado en sitio";

        return (
          <TooltipProvider>
            <div className="flex items-center gap-1 justify-end pr-2">
              {/* Botón de Confirmar Pago */}
              {isPending && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleConfirm(row.payment_id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Confirmar y completar pago</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Botón de Ver Recibo */}
              {hasReceipt && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => window.open(row.receipt_url, "_blank")}
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver recibo digital</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <DataTable
        columns={columns}
        data={payments || []}
        isLoading={isLoading}
        rowIdKey="payment_id"
        enableRowSelection={false}
      />
    </div>
  );
}