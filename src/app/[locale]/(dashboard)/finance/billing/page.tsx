"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useInvoices } from "@/hooks/billing/use-invoices";
import { useAuth } from "@/context/AuthContext";
import { InvoiceTable } from "@/components/modules/billing/InvoiceTable";
import { useBranches } from "@/hooks/branches/useBranches";
import { useRouter } from "@/i18n/navigation";
import { Building2, Plus, Search } from "lucide-react";

export default function BillingPage() {
  const t = useTranslations("finance.Billing");
  const router = useRouter();
  const { token, user, hasRole } = useAuth();

  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    user?.activeBranch?.id
  );

  const { branches, isLoading: loadingBranches } = useBranches({
    token: token ?? "",
    limit: 100,
  });

  const {
    data,
    loading,
    totalPages,
    filters,
    updateFilters,
    changePage,
    refresh,
  } = useInvoices(token ?? "", selectedBranch);

  useEffect(() => {
    if (user?.activeBranch?.id) {
      setSelectedBranch(user.activeBranch.id);
    }
  }, [user?.activeBranch?.id]);

  if (!token) {
    return null;
  }

  const canSwitchBranch = hasRole([
    "branch_admin",
    "super_admin",
    "accountant",
  ] as any);

  const canCreateInvoice = hasRole(["branch_admin", "super_admin"] as any);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title={t("title")}
          subtitle={
            user?.activeBranch
              ? t("managing", { branchName: user.activeBranch.name })
              : t("subtitle")
          }
        />

        {canCreateInvoice && (
          <Button onClick={() => router.push("/finance/billing/new")}>
            <Plus className="h-4 w-4 mr-2" /> {t("newInvoiceTitle")}
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-10 focus-visible:ring-primary"
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <Select
            value={selectedBranch || "all"}
            onValueChange={(v) =>
              setSelectedBranch(v === "all" ? undefined : v)
            }
            disabled={loadingBranches || !canSwitchBranch}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder={t("branchPlaceholder")} />
              </div>
            </SelectTrigger>

            <SelectContent className="max-h-[300px]">
              {canSwitchBranch && (
                <SelectItem value="all">{t("allBranches")}</SelectItem>
              )}
              {branches.map((branch) => (
                <SelectItem key={branch.branch_id} value={branch.branch_id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) =>
              updateFilters({ status: v === "all" ? undefined : (v as any) })
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("status.all")}</SelectItem>
              <SelectItem value="Paid">{t("status.paid")}</SelectItem>
              <SelectItem value="Unpaid">{t("status.unpaid")}</SelectItem>
              <SelectItem value="Overdue">{t("status.overdue")}</SelectItem>
              <SelectItem value="Void">{t("status.void")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <InvoiceTable
        data={data}
        isLoading={loading}
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={changePage}
        onActionSuccess={refresh}
      />
    </div>
  );
}
