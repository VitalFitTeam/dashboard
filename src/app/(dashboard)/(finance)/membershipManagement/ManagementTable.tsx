"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Percent } from "lucide-react";
import { useRouter } from "next/navigation";
import { MembershipPayment } from "./data";
import { Badge } from "@/components/ui/badge";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface ManagementTableProps {
  data: MembershipPayment[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; status: string; startDate: string; endDate: string };
  onFilterChange: (filters: { search?: string; status?: string; startDate?: string; endDate?: string }) => void;
}

export default function ManagementTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: ManagementTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput.trim() === "") {
        if (filters.search !== "") {
          onFilterChange({ search: "" });
        }
      } else if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput, filters.search, onFilterChange]);

  // Efecto para aplicar filtros de fecha con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (startDate !== filters.startDate || endDate !== filters.endDate) {
        onFilterChange({ startDate, endDate });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [startDate, endDate, filters.startDate, filters.endDate, onFilterChange]);

  const handleView = (row: MembershipPayment) => {
    router.push(`/administrator/membershipManagement/${row.payment_id}`);
  };

  const handleManualPayment = (row: MembershipPayment) => {
    router.push(`/administrator/membershipManagement/${row.payment_id}/manual-payment`);
  };

  const handleGenerateInvoice = (row: MembershipPayment) => {
    // Aquí iría la lógica para generar factura
    console.log("Generando factura para:", row.invoice);
  };

  const handleApplyDiscount = (row: MembershipPayment) => {
    router.push(`/administrator/membershipManagement/${row.payment_id}/apply-discount`);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setStartDate("");
    setEndDate("");
    onFilterChange({ search: "", status: "all", startDate: "", endDate: "" });
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.startDate || filters.endDate;

  const StatusBadge = ({ status }: { status: MembershipPayment["status"] }) => {
    const variantMap = {
      completed: "default",
      failed: "destructive",
      refunded: "outline",
      pending: "secondary"
    };

    const labels = {
      completed: "Completado",
      failed: "Fallido",
      refunded: "Reembolsado",
      pending: "Pendiente"
    };

    return (
      <Badge variant={variantMap[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  const columns: Column<MembershipPayment>[] = [
    { header: "Factura", accessor: "invoice", filterType: "text" },
    { header: "Cliente", accessor: "client", filterType: "text" },
    { header: "Fecha Pago", accessor: "payment_date", filterType: "text" },
    { header: "Monto pagado", accessor: "amount_paid", filterType: "text" },
    { header: "Moneda pagada", accessor: "currency_paid", filterType: "text" },
    { 
      header: "Método", 
      accessor: "payment_method", 
      filterType: "text",
      render: (value) => {
        const methods = {
          paypal: "PayPal",
          cash: "Efectivo",
          card: "Tarjeta",
          transfer: "Transferencia"
        };
        return methods[value as keyof typeof methods];
      }
    },
    { 
      header: "Status", 
      accessor: "status", 
      filterType: "text",
      render: (value) => <StatusBadge status={value as MembershipPayment["status"]} />
    },
  ];

  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Primera fila: Búsqueda, Status y Exportar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-[250px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="N° de Factura"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs">Desde</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-[150px]"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs">Hasta</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-[150px]"
            />
          </div>

          {hasActiveFilters && (
            <div className="flex flex-col justify-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2 h-10"
              >
                Limpiar campos
              </Button>
            </div>
          )}

          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange({ status: value })}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los status</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </div>
        </div>
      </div>

      <DataTable<MembershipPayment>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="payment_id"
        actions={(row) => (
          <RowActions
            actions={[
              { label: "Ver detalles", icon: Eye, onClick: () => handleView(row) },
              { label: "Registrar Pago", icon: CurrencyDollarIcon, onClick: () => handleManualPayment(row) },
              { label: "Generar Factura", icon: Download, onClick: () => handleGenerateInvoice(row) },
              { label: "Aplicar descuento", icon: Percent, onClick: () => handleApplyDiscount(row), separatorBefore: true },
            ]}
          />
        )}
      />
    </>
  );
}