import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

export default async function SalesPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
      <PageHeader
        title="Reporte de Finanzas Detallado"
        subtitle="Análisis detallado de finanzas de la franquicia"
        actionButton={
          <Button
            variant="outline"
          >
            Exportar
          </Button>
        }
      ></PageHeader>
    </main>
  );
}