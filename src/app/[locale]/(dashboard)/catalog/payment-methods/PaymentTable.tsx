"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";

import { PaymentMethod } from "@vitalfit/sdk";
import { useTranslations } from "next-intl";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface PaymentTableProps {
  data: PaymentMethod[];
  loading: boolean;
  pagination: { page: number; totalPages: number; setPage: (p: number) => void };
  filters: { type: string; status: string; search: string };
  setFilters: (f: any) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onRefresh: () => void;
}

export default function PaymentTable({
  data, loading, pagination, filters, setFilters, searchQuery, setSearchQuery, onRefresh
}: PaymentTableProps) {
  const t = useTranslations("catalog.payment_methods");
  const router = useRouter();
  const { token } = useAuth();

  // El diálogo se controla aquí porque es una acción efímera de UI
  const [deleteRow, setDeleteRow] = useState<PaymentMethod | null>(null);

  const handleDelete = async () => {
    if (!token || !deleteRow) {
      return;
    }
    try {
      await api.paymentMethod.deletePaymentMethod(deleteRow.method_id, token);
      toast.success(t("notifications.delete_success"));
      setDeleteRow(null);
      onRefresh(); 
    } catch {
      toast.error(t("notifications.delete_error"));
    }
  };

  const columns: Column<PaymentMethod>[] = [
    { header: t("table.columns.name"), accessor: "name" },
    {
      header: t("table.columns.type"),
      accessor: "type",
      render: (type) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 capitalize">
          {t(`table.types.${String(type).toLowerCase()}`)}
        </span>
      )
    },
    {
      header: t("table.columns.status"),
      accessor: "global_status",
      render: (status) => (
        <span className={`px-2 py-0.5 rounded-full text-xs border ${status ? "text-green-700 border-green-200" : "text-red-700 border-red-200"}`}>
          {status ? t("table.status.active") : t("table.status.inactive")}
        </span>
      )
    }
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 gap-4 min-w-[300px]">
          <div className="relative w-[250px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("table.filter_placeholder")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filters.type || "all"}
            onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("table.all_types")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("table.all_types")}</SelectItem>
              <SelectItem value="Cash">{t("table.types.cash")}</SelectItem>
              <SelectItem value="Card">{t("table.types.card")}</SelectItem>
              <SelectItem value="Transfer">{t("table.types.transfer")}</SelectItem>
              <SelectItem value="Other">{t("table.types.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {t("table.update_button")}
        </Button>
      </div>

      <DataTable<PaymentMethod>
        columns={columns}
        data={data}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
        isLoading={loading}
        rowIdKey="method_id"
        actions={(row) => (
          <RowActions
            actions={[
              { label: t("table.actions.view"), icon: Eye, onClick: () => router.push(`/catalog/payment-methods/${row.method_id}`) },
              { label: t("table.actions.edit"), icon: Pencil, onClick: () => router.push(`/catalog/payment-methods/${row.method_id}/edit`) },
              { label: t("table.actions.delete"), icon: Trash2, onClick: () => setDeleteRow(row), variant: "danger", separatorBefore: true },
            ]}
          />
        )}
      />

      <GeneralAlertDialog
        open={Boolean(deleteRow)} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteRow(null);
          }
        }}
        title={t("table.delete_dialog.title")}
        // Usamos un condicional opcional para evitar el crash
        description={`${t("table.delete_dialog.description")} ${deleteRow?.name ?? ""}`}
        actionText={t("table.delete_dialog.action_delete")}
        onAction={handleDelete}
        actionVariant="destructive"
      />
    </>
  );
}