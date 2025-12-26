"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter } from "next/navigation";
import { MembershipType } from "@vitalfit/sdk";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface MembershipTableProps {
  data: MembershipType[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string };
  onFilterChange: (filters: { search?: string }) => void;
}

export default function MembershipTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: MembershipTableProps) {
  const t = useTranslations("catalog.memberships");
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);

  const { token } = useAuth();
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
  }, [searchInput]);

  const handleView = (row: MembershipType) => {
    router.replace(`/catalog/memberships/${row.membership_type_id}`);
  };

  const handleEdit = (row: MembershipType) => {
    router.replace(`/catalog/memberships/${row.membership_type_id}/edit`);
  };

  const handleDelete = async (membership: MembershipType) => {
    const membershipId = membership.membership_type_id;

    if (!token) {
      toast.error(t("notifications.delete_auth_error"));
      setDeleteRowId(null);
      return;
    }

    try {
      await api.membership.deleteMembershipType(membershipId, token);
      toast.success(t("notifications.delete_success"));
      onReload();
    } catch (error) {
      console.error("Error al eliminar la membresía:", error);
      toast.error(t("notifications.delete_error"));
    } finally {
      setDeleteRowId(null);
    }
  };

  const columns: Column<MembershipType>[] = [
    { header: t("table.columns.name"), accessor: "name" },
    { header: t("table.columns.description"), accessor: "description" },
    { header: t("table.columns.duration"), accessor: "duration_days" },
    { header: t("table.columns.price"), accessor: "price" },
    {
      header: t("table.columns.status"),
      accessor: "is_active",
      render: (value) => {
        const config = value
          ? { text: t("table.status.active"), color: "text-green-700 border-green-300" }
          : { text: t("table.status.inactive"), color: "text-yellow-700 border-yellow-300" };
        return (
          <Badge variant="outline" className={`border ${config.color}`}>
            {config.text}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("table.placeholder")}
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            {t("table.download")}
          </Button>
        </div>
      </div>

      <DataTable<MembershipType>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="membership_type_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                {
                  label: t("table.actions.view"),
                  icon: Eye,
                  onClick: () => handleView(row),
                },
                {
                  label: t("table.actions.edit"),
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: t("table.actions.delete"),
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.membership_type_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.membership_type_id && (
              <GeneralAlertDialog
                open={deleteRowId === row.membership_type_id}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title={t("table.delete_dialog.title")}
                description={t("table.delete_dialog.description")}
                actionText={t("table.delete_dialog.confirm")}
                cancelText={t("table.delete_dialog.cancel")}
                onAction={() => handleDelete(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />
    </>
  );
}
