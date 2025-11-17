"use client";
import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import PaymentTable from "./PaymentTable";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { PaymentMethod } from "@vitalfit/sdk";

export default function PaymentMethodsPage() {
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
          title="TOTAL"
          value={
            <>
              <h3 className={"ml-1.5 font-heading"}>{stats.total} MÉTODOS</h3>
            </>
          }
          description=""
        />
        <StatCard
          title="EFECTIVO"
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-green-500"}>
                {stats.cash} MÉTODOS
              </h3>
            </>
          }
          description=""
        />
        <StatCard
          title="GATEWAY"
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-blue-500"}>
                {stats.gateway} MÉTODOS
              </h3>
            </>
          }
          description=""
        />
        <StatCard
          title="DIGITAL"
          value={
            <>
              <h3 className={"ml-1.5 font-heading text-primary"}>
                {stats.digital} MÉTODOS
              </h3>
            </>
          }
          description=""
        />
      </div>

      <PageHeader title="MÉTODOS DE PAGO">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/payment-methods/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar un metodo de pago
        </Button>
      </PageHeader>

      <PaymentTable onStatsUpdate={handleStatsUpdate} />
    </div>
  );
}
