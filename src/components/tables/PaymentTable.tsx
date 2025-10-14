"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./DataTable";

type Payment = {
  id: string;
  amount: number;
  status: "success" | "pending" | "failed";
};

const columns: Column<Payment>[] = [
  {
    header: "ID",
    accessor: "id",
  },
  {
    header: "Monto",
    accessor: "amount",
    render: (value) => `$${value}`,
  },
  {
    header: "Estatus",
    accessor: "status",
    render: (value) => {
      const status = value as Payment["status"];
      return (
        <Badge
          variant={
            status === "success"
              ? "default"
              : status === "pending"
                ? "secondary"
                : "destructive"
          }
        >
          {status === "success"
            ? "Completado"
            : status === "pending"
              ? "Pendiente"
              : "Fallido"}
        </Badge>
      );
    },
  },
];

const data: Payment[] = [
  { id: "P-001", amount: 150, status: "success" },
  { id: "P-002", amount: 200, status: "pending" },
  { id: "P-003", amount: 80, status: "failed" },
];

export default function PaymentTable() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Pagos recientes</h2>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
