"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { useLocale, useTranslations } from "next-intl"; // Importamos useTranslations

export default function PaymentsTable({ data, page, totalPages, onPageChange, isLoading, filters, onFilterChange }: any) {
  const locale = useLocale();
  const t = useTranslations("clients.payments"); // Usamos el namespace de pagos
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput, filters.search, onFilterChange]);

  const columns: Column<any>[] = [
    {
      header: t("table.reference"), // Traducción: "Referencia"
      accessor: "invoice_id",
      render: (val) => (
        <span className="font-medium text-gray-900">
          {String(val).substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: t("table.date"), // Traducción: "Fecha de Emisión"
      accessor: "issue_date",
      render: (value) => (
        <span className="text-gray-600">
          {new Date(value as string).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}
        </span>
      )
    },
    {
      header: t("table.amount"), // Traducción: "Monto Total"
      accessor: "total_amount",
      render: (value) => (
        <span className="font-bold">
          {new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
            style: "currency",
            currency: "USD",
          }).format(Number(value))}
        </span>
      )
    },
    {
      header: t("table.status"), // Traducción: "Estado"
      accessor: "status",
      render: (value) => {
        const val = String(value).toLowerCase();
        const variant = 
          val === "paid" || val === "pagado" ? "success" : 
          val === "unpaid" || val === "pendiente" ? "warning" : "error";
          
        return (
          <Badge variant={variant as any} className="font-bold uppercase tracking-wide">
            {t(`status.${val}`) || value} 
          </Badge>
        );
      }
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[300px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("table.search_placeholder")} // Traducción del placeholder
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isLoading={isLoading}
        rowIdKey="invoice_id"
      />
    </>
  );
}