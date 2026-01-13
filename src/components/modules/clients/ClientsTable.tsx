"use client";

import { useMemo } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useClientActions } from "@/hooks/clients/useClientActions";
import { User } from "@vitalfit/sdk";

export interface Client extends User {
  role_name: string;
}

interface ClientsTableProps {
  data: Client[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems?: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  filters: { search: string; role: string };
  onFilterChange: (filters: { search?: string; role?: string }) => void;
  searchInput: string;
  setSearchInput: (val: string) => void;
}

export default function ClientsTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  totalItems,
  isLoading = false,
  onPageChange,
  searchInput,
  setSearchInput,
}: ClientsTableProps) {
  const t = useTranslations("clients");
  const { token } = useAuth();

  const { 
    isDeleting, 
    deleteRowId, 
    setDeleteRowId, 
    deleteClient, 
    handleView, 
    handleEdit 
  } = useClientActions(token);

  const columns = useMemo<Column<Client>[]>(() => [
    {
      header: t("table.columns.name"),
      accessor: "first_name",
      render: (_, row) => (
        <div className="flex flex-col text-left">
          <span className="font-medium text-foreground leading-none">
            {`${row.first_name} ${row.last_name}`}
          </span>
          {row.identity_document && (
            <span className="text-[10px] text-muted-foreground mt-1">
              ID: {row.identity_document}
            </span>
          )}
        </div>
      )
    },
    { 
      header: t("table.columns.email"), 
      accessor: "email",
      render: (val) => <span className="text-sm">{String(val)}</span>
    },
    { 
      header: t("table.columns.role"), 
      accessor: "role_name", 
      render: (val) => (
        <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-0.5 text-[11px] font-medium capitalize border border-border">
          {String(val) || "N/A"}
        </span>
      )
    },
    {
      header: t("table.columns.status"),
      accessor: "is_validated",
      render: (val) => (
        <Badge variant={val ? "success" : "error"} className="capitalize">
          {val ? t("table.status.active") : t("table.status.blocked")}
        </Badge>
      )
    },
  ], [t]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full sm:w-[300px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("table.filter_placeholder")}
              className="pl-9 h-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>      
        </div>

        <Button variant="outline" size="sm" className="h-9">
          <Download className="mr-2 h-4 w-4" />
          {t("table.download")}
        </Button>
      </div>

      <DataTable<Client>
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        rowIdKey="user_id" 
        actions={(row) => (
          <div className="flex items-center justify-center">
            <RowActions
              actions={[
                { 
                  label: t("table.actions.view"), 
                  icon: Eye, 
                  onClick: () => handleView(row.user_id) 
                },
                { 
                  label: t("table.actions.edit"), 
                  icon: Pencil, 
                  onClick: () => handleEdit(row.user_id) 
                },
                {
                  label: t("table.actions.delete"),
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.user_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />

            <GeneralAlertDialog
              open={deleteRowId === row.user_id}
              onOpenChange={(open) => !open && setDeleteRowId(null)}
              title={t("table.delete_dialog.title")}
              description={t("table.delete_dialog.description")}
              actionText={isDeleting ? t("table.delete_dialog.action_deleting") : t("table.delete_dialog.action_delete")}
              cancelText={t("table.delete_dialog.action_cancel")}
              onAction={() => deleteClient(row.user_id, onReload)}
              actionVariant="destructive"
            />
          </div>
        )}
      />
    </div>
  );
}