"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { usePaymentMethods } from "@/hooks/payment-methods/usePaymentMethods";
import PaymentTable from "@/components/modules/payment-methods/PaymentTable";

export default function PaymentMethodsPage() {
  const t = useTranslations("catalog.payment_methods");
  const router = useRouter();
  const { token } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");

  const { 
  methods,
  stats, 
  loading, 
  filters, 
  setFilters, 
  pagination, 
  refresh 
} = usePaymentMethods(token);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchQuery });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t("stats.total")}
          value={<h3 className="ml-1.5 font-bold text-primary">{stats.total ?? 0}</h3>}
        />
        <StatCard
          title={t("stats.cash")}
          value={<h3 className="ml-1.5 font-bold text-green-500">{stats.cash ?? 0}</h3>}
        />
        <StatCard
          title={t("stats.gateway")}
          value={<h3 className="ml-1.5 font-bold text-blue-500">{stats.gateway ?? 0}</h3>}
        />
        <StatCard
          title={t("stats.digital")}
          value={<h3 className="ml-1.5 font-bold text-primary">{stats.digital ?? 0}</h3>}
        />
      </div>

      <PageHeader title={t("title")}>
        <Button onClick={() => router.push("/catalog/payment-methods/new")}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("add_button")}
        </Button>
      </PageHeader>

      <PaymentTable
        data={methods}
        loading={loading}
        pagination={pagination}
        filters={filters}
        setFilters={setFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={refresh}
      />
    </div>
  );
}