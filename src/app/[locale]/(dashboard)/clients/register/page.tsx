"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import ClientsTable from "./ClientsTable";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { useClients } from "@/hooks/useClients";
import { useRouter } from "@/i18n/navigation";

export default function Clients() {
  const t = useTranslations("clients");
  const router = useRouter();
  const { token } = useAuth();

  const {
    data,
    isLoading,
    pagination,
    filters,
    onFilterChange,
    stats,
    reload
  } = useClients({ token });

  const { page, limit, totalPages, totalItems, onPageChange } = pagination;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t("stats.total")}
          value={<h3 className="text-4xl">{stats.total} {t("stats.unit")}</h3>}
        />
        <StatCard
          title={t("stats.active")}
          value={<h3 className="text-4xl text-green-500">{stats.active} {t("stats.unit")}</h3>}
        />
        <StatCard
          title={t("stats.inactive")}
          value={<h3 className="text-4xl text-red-500">{stats.blocked} {t("stats.unit")}</h3>}
        />
      </div>

      <PageHeader title={t("title")} >
        <Button onClick={() => router.push("/clients/register/new")} variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("add_button")}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">{t("table.loading")}</div>
      ) : (
        <ClientsTable
          data={data.map(user => ({
            client_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            category: (user as any).ClientProfile?.category || "Regular",
            status: user.is_validated ? "active" : "blocked",
            role: (user as any).role
          }))}
          onReload={reload}
          page={page}
          pageSize={limit}
          onPageChange={onPageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={onFilterChange}
          totalItems={totalItems}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}