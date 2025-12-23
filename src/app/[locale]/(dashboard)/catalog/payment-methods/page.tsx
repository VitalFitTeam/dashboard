"use client";
import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import PaymentTable from "./PaymentTable";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { PaymentMethod } from "@vitalfit/sdk";
import { useTranslations } from "next-intl";

export default function PaymentMethodsPage() {
  const t = useTranslations("catalog.payment_methods");
  const router = useRouter();
  const { token } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    cash: 0,
    gateway: 0,
    digital: 0,
  });

  const calculateStats = useCallback((paymentMethods: PaymentMethod[]) => {
    const total = paymentMethods.length;
    const cash = paymentMethods.filter((pm) => pm.type === "Cash").length;
    const gateway = paymentMethods.filter(
      (pm) => pm.processing_type === "Gateway",
    ).length;
    const digital = paymentMethods.filter(
      (pm) =>
        pm.type === "Card" || pm.type === "Transfer" || pm.type === "Other",
    ).length;

    setStats({
      total,
      cash,
      gateway,
      digital,
    });
  }, []);

  const handleStatsUpdate = useCallback(
    (paymentMethods: PaymentMethod[]) => {
      calculateStats(paymentMethods);
    },
    [calculateStats],
  );

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t("stats.total")}
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-primary"}>{stats.total} {t("stats.unit")}</h3>
            </>
          }
          description=""
        />
        <StatCard
          title={t("stats.cash")}
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-green-500"}>
                {stats.cash} {t("stats.unit")}
              </h3>
            </>
          }
          description=""
        />
        <StatCard
          title={t("stats.gateway")}
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-blue-500"}>
                {stats.gateway} {t("stats.unit")}
              </h3>
            </>
          }
          description=""
        />
        <StatCard
          title={t("stats.digital")}
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-primary"}>
                {stats.digital} {t("stats.unit")}
              </h3>
            </>
          }
          description=""
        />
      </div>

      <PageHeader title={t("title")}>
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/catalog/payment-methods/new")}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("add_button")}
        </Button>
      </PageHeader>

      <PaymentTable onStatsUpdate={handleStatsUpdate} />
    </div>
  );
}
