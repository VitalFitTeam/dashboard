"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Building2 } from "lucide-react";

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

export default function BillingPage() {
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

  const canSwitchBranch = hasRole(["admin", "super_admin","account"] as any);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Facturas y Pagos."
          subtitle={
            user?.activeBranch
              ? `Gestionando: ${user.activeBranch.name}`
              : "Administra tus facturas y métodos de pago aquí."
          }
        />
        <Button onClick={() => router.push("/finance/billing/new")}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Factura
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente o número..."
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
                <SelectValue placeholder="Sucursal" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {canSwitchBranch && (
                <SelectItem value="all">Todas las sucursales</SelectItem>
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
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Paid">Pagado</SelectItem>
              <SelectItem value="Unpaid">Pendiente</SelectItem>
              <SelectItem value="Overdue">Vencido</SelectItem>
              <SelectItem value="Void">Anulado</SelectItem>
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
