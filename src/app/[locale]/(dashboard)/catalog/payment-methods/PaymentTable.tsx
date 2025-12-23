"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { PaymentMethod } from "@vitalfit/sdk";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentTableProps {
  onStatsUpdate?: (paymentMethods: PaymentMethod[]) => void;
}

export default function PaymentTable({ onStatsUpdate }: PaymentTableProps) {
  const t = useTranslations("catalog.payment_methods");
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [deleteRow, setDeleteRow] = useState<PaymentMethod | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const getFilteredData = useCallback(() => {
    let filtered = data;

    if (filters.search) {
      filtered = filtered.filter(
        (payment) =>
          payment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (typeof payment.description === "string" &&
            payment.description
              .toLowerCase()
              .includes(filters.search.toLowerCase())),
      );
    }

    if (filters.type) {
      filtered = filtered.filter((payment) => payment.type === filters.type);
    }

    if (filters.status) {
      if (filters.status === "active") {
        filtered = filtered.filter((payment) => payment.global_status === true);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter(
          (payment) => payment.global_status === false,
        );
      }
    }

    return filtered;
  }, [data, filters.search, filters.type, filters.status]);

  const notifyStats = useCallback(
    (paymentMethods: PaymentMethod[]) => {
      if (onStatsUpdate) {
        onStatsUpdate(paymentMethods);
      }
    },
    [onStatsUpdate],
  );

  const fetchPaymentMethods = async () => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const response = await api.paymentMethod.getPaymentMethods(token);
      const paymentMethods = response.data || [];
      setData(paymentMethods);

      const totalItems = paymentMethods.length;
      setTotalPages(Math.ceil(totalItems / pageSize));

      notifyStats(paymentMethods);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast.error(t("notifications.error_title"), {
        description: t("notifications.load_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput.trim() === "") {
        if (filters.search !== "") {
          setFilters((prev) => ({ ...prev, search: "" }));
        }
      } else if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput }));
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput, filters.search]);

  useEffect(() => {
    const filteredData = getFilteredData();
    notifyStats(filteredData);
  }, [getFilteredData, notifyStats]);

  const handleTypeChange = (type: string) => {
    const newType = type === "all" ? "" : type;
    setFilters((prev) => ({ ...prev, type: newType }));
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    const newStatus = status === "all" ? "" : status;
    setFilters((prev) => ({ ...prev, status: newStatus }));
    setPage(1);
  };

  const filteredData = getFilteredData();

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / pageSize));
  }, [filteredData.length, pageSize]);

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleView = (row: PaymentMethod) => {
    router.push(`/catalog/payment-methods/${row.method_id}`);
  };

  const handleEdit = (row: PaymentMethod) => {
    router.push(`/catalog/payment-methods/${row.method_id}/edit`);
  };

  const handleDeletePaymentMethod = async (payment: PaymentMethod) => {
    if (!token) {
      setDeleteRow(null);
      return;
    }
    try {
      await api.paymentMethod.deletePaymentMethod(payment.method_id, token);

      toast.success(t("notifications.success_title"), {
        description: t("notifications.delete_success"),
      });

      setDeleteRow(null);

      setTimeout(() => {
        fetchPaymentMethods();
      }, 1000);
    } catch (error) {
      console.error("Error deleting payment method:", error);
      setDeleteRow(null);

      toast.error(t("notifications.error_title"), {
        description: t("notifications.delete_error"),
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      Cash: t("table.types.cash"),
      Card: t("table.types.card"),
      Transfer: t("table.types.transfer"),
      Other: t("table.types.other"),
    };
    return typeMap[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      Cash: "text-green-800 border-green-200",
      Card: "text-blue-800 border-blue-200",
      Transfer: "text-orange-800 border-orange-200",
      Other: "text-orange-800 border-orange-200",
    };

    const colorClass =
      typeColors[type] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      >
        {getTypeDisplayName(type)}
      </span>
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status
<<<<<<< HEAD
          ? "text-green-800 border-green-200"
          : "text-red-800 border-red-200"
=======
            ? "text-green-800 border-green-200"
            : "text-red-800 border-red-200"
>>>>>>> development
          }`}
      >
        {status ? t("table.status.active") : t("table.status.inactive")}
      </span>
    );
  };

  const columns: Column<PaymentMethod>[] = [
    {
      header: t("table.columns.name"),
      accessor: "name",
      filterType: "text",
    },
    {
      header: t("table.columns.type"),
      accessor: "type",
      filterType: "text",
      render: (type) => getTypeBadge(type as string),
    },
    {
      header: t("table.columns.description"),
      accessor: "description",
      filterType: "text",
<<<<<<< HEAD
      render: (description) =>
        (typeof description === "string" && description) ? description : "-",
=======
      render: (description) => {
        if (typeof description === "string" || typeof description === "number") {
          return description.toString() || "-";
        }
        return "-";
      },
>>>>>>> development
    },
    {
      header: t("table.columns.status"),
      accessor: "global_status",
      filterType: "text",
      render: (status) => getStatusBadge(status as boolean),
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t("view.loading")}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative w-full sm:w-[250px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("table.filter_placeholder")}
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <Select
              value={filters.type || "all"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("table.all_types")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("table.all_types")}</SelectItem>
                <SelectItem value="Cash">{t("table.types.cash")}</SelectItem>
                <SelectItem value="Card">{t("table.types.card")}</SelectItem>
                <SelectItem value="Transfer">{t("table.types.transfer")}</SelectItem>
                <SelectItem value="Other">{t("table.types.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[200px]">
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("table.all_statuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("table.all_statuses")}</SelectItem>
                <SelectItem value="active">{t("table.status.active")}</SelectItem>
                <SelectItem value="inactive">{t("table.status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={fetchPaymentMethods}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? t("table.updating") : t("table.update_button")}
          </Button>
        </div>
      </div>

      <DataTable<PaymentMethod>
        key={`payment-methods-${filteredData.length}-${filters.type}-${filters.status}-${filters.search}-${page}`}
        columns={columns}
        data={paginatedData}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        rowIdKey="method_id"
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
                  onClick: () => setDeleteRow(row),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
          </div>
        )}
      />

      <GeneralAlertDialog
        open={!!deleteRow}
        onOpenChange={(open) => !open && setDeleteRow(null)}
        trigger={null}
        title={t("table.delete_dialog.title")}
        description={t("table.delete_dialog.description")}
        actionText={t("table.delete_dialog.action_delete")}
        cancelText={t("table.delete_dialog.action_cancel")}
        onAction={() => deleteRow && handleDeletePaymentMethod(deleteRow)}
        actionVariant="destructive"
      />
    </>
  );
}
