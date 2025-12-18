import { PageHeader } from "@/components/ui/PageHeader";
import SalesReport from "./SalesReport";
import { Button } from "@/components/ui/button";

export default async function SalesPage() {
  return (
    <main className="min-h-screen dark:bg-gray-900 p-6 md:p-10">
      <PageHeader
        title="Reporte de Ventas Detallado"
        subtitle="Análisis detallado de ventas"
        actionButton={
          <Button
            variant="outline"
          >
            Exportar
          </Button>
        }
      ></PageHeader>
      <SalesReport />
    </main>
  );
}
