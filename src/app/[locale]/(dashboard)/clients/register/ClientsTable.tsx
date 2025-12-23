"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Client {
  client_id: string;
  first_name: string;
  last_name: string;
  email: string;
  category: string;
  status: string;
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
  filters: { search: string; category: string };
  onFilterChange: (filters: { search?: string; category?: string }) => void;
}

export default function ClientsTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  totalItems = 0,
  isLoading = false,
  onPageChange,
  filters,
  onFilterChange,
}: ClientsTableProps) {
  const t = useTranslations("clients");
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { token } = useAuth();

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

  const handleView = (row: Client) => {
    router.replace(`/clients/register/${row.client_id}`);
  };

  const handleEdit = (row: Client) => {
    router.replace(`/clients/register/${row.client_id}/edit`);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!token) {
      toast.error(t("notifications.error_title"), {
        description: t("notifications.no_token"),
      });
      return;
    }

    setIsDeleting(true);
    try {
      await api.user.deleteUser(client.client_id, token);

      toast.success(t("notifications.success_title"), {
        description: t("notifications.delete_success"),
      });

      setDeleteRowId(null);

      setTimeout(() => {
        onReload();
      }, 1000);

    } catch (error: any) {
      console.error("Error deleting client:", error);

      let errorMessage = t("notifications.delete_error");

      if (error.status === 403) {
        errorMessage = t("notifications.permission_error");
      } else if (error.status === 404) {
        errorMessage = t("notifications.not_found");
      } else if (error.status === 401) {
        errorMessage = t("notifications.session_expired");
        router.replace("/login");
      }
      else if (error.messages && Array.isArray(error.messages)) {
        errorMessage = error.messages.join(", ");
      }

      toast.error(t("notifications.error_title"), {
        description: errorMessage,
      });

    } finally {
      setIsDeleting(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variantMap: Record<string, any> = {
  active: "success",
  inactive: "error",
  pending: "warning",
};

    const displays: Record<string, string> = {
      active: t("table.status.active"),
      inactive: t("table.status.inactive"),
      blocked: t("table.status.blocked"),
      pending: t("table.status.pending")
    };

    const normalizedStatus = (status || "inactive").toLowerCase();
    const variant = (variantMap[normalizedStatus] || "default") as "default" | "success" | "error" | "warning" | "info" | "secondary" | "outline";

    return (
     <Badge variant={variant}>
    {status}
  </Badge>
    );
  };

  const columns: Column<Client>[] = [
    {
      header: t("table.columns.name"),
      accessor: "first_name",
      filterType: "text",
      render: (_, row) => `${row.first_name} ${row.last_name}`
    },
    {
      header: t("table.columns.email"),
      accessor: "email",
      filterType: "text"
    },
    {
      header: t("table.columns.category"),
      accessor: "category",
      filterType: "text"
    },
    {
      header: t("table.columns.status"),
      accessor: "status",
      filterType: "text",
      render: (value) => <StatusBadge status={value as string} />
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("table.filter_placeholder")}
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ category: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("table.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("table.all_categories")}</SelectItem>
            <SelectItem value="premium">{t("table.categories.premium")}</SelectItem>
            <SelectItem value="regular">{t("table.categories.regular")}</SelectItem>
            <SelectItem value="new">{t("table.categories.new")}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t("table.download")}
        </Button>
      </div>

      <DataTable<Client>
        key={`table-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        rowIdKey="client_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: t("table.actions.view"), icon: Eye, onClick: () => handleView(row) },
                {
                  label: t("table.actions.edit"),
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: t("table.actions.delete"),
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.client_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />

            {deleteRowId === row.client_id && (
              <GeneralAlertDialog
                open={true}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title={t("table.delete_dialog.title")}
                description={t("table.delete_dialog.description")}
                actionText={isDeleting ? t("table.delete_dialog.action_deleting") : t("table.delete_dialog.action_delete")}
                cancelText={t("table.delete_dialog.action_cancel")}
                onAction={() => handleDeleteClient(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />
    </>
  );
}