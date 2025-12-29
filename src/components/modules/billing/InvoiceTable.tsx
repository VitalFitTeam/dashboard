"use client";

import * as React from "react";
import { InvoiceList } from "@vitalfit/sdk";
import { Eye, DollarSign, Trash2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/i18n/navigation";

interface InvoiceTableProps {
  data: InvoiceList[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onActionSuccess: () => void;
}

export function InvoiceTable({
  data,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  onActionSuccess,
}: InvoiceTableProps) {
  const router = useRouter();
  const [invoiceToVoid, setInvoiceToVoid] = React.useState<InvoiceList | null>(
    null
  );

  const handleView = (id: string) => {
    router.push(`/finance/billing/${id}`);
  };




 const columns: Column<InvoiceList>[] = [
  { 
    header: "Nro. Factura", 
    accessor: "invoice_number" 
  },
  { 
    header: "Cliente", 
    accessor: "client_name" 
  },
  { 
    header: "Fecha", 
    accessor: "issue_date", 
    render: (v) => new Date(v as string).toLocaleDateString("es-ES") 
  },
  {
    header: "Total (USD)",
    accessor: "total_amount",
    render: (v) => {
      const amount = parseFloat(v as string);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(amount);
    },
  },
  {
    header: "Estado",
    accessor: "status",
    render: (value) => {
      const status = value as string;
      const config: Record<string, { label: string; variant: "success" | "warning" | "error" | "outline" }> = {
        Paid: { label: "Pagado", variant: "success" },
        Unpaid: { label: "Pendiente", variant: "warning" },
        Overdue: { label: "Vencido", variant: "error" },
        Void: { label: "Anulado", variant: "outline" },
      };
      const s = config[status] || { label: status, variant: "outline" };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
];


  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        rowIdKey="invoice_id"
        actions={(row) => (
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row.invoice_id)}
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </Button>


          </div>
        )}
      />

    </>
  );
}
