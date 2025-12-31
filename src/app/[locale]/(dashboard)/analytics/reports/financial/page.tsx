"use client"; 

import { AverageTicketStat, CLVStat, MRRStat, WeeklyRevenueStat } from "@/components/modules/analytics/finance/FinancialStats";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function FianancePage() {
  const { token } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
      <PageHeader
        title="Reporte de Finanzas Detallado"
        subtitle="Análisis detallado de finanzas de la franquicia"
        actionButton={<Button variant="outline">Exportar</Button>}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <WeeklyRevenueStat token={token} />
        <MRRStat token={token} />
        <AverageTicketStat token={token} />
        <CLVStat token={token} />
      </section>

      {/* 3. Sección de Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* Aquí irán tus gráficos en el siguiente paso */}
      </section>
    </main>
  );
}