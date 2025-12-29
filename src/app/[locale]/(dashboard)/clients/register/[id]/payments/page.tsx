"use client";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import PaymentsTable from "./PaymentsTable";
import { useTranslations } from "next-intl"; // Importar

export default function ClientPaymentsPage() {
    const params = useParams();
    const t = useTranslations("clients.payments"); // Namespace
    
    const { 
        data, 
        isLoading, 
        page, 
        totalPages, 
        handlePageChange,
        filters,
        onFilterChange 
    } = usePaymentHistory(params.id as string);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader 
                title={t("title")} // Traducción: "Historial de Facturas y Pagos"
                subtitle={t("subtitle")} // Traducción: "Consulta el registro..."
            />
            <Card>
                <CardContent className="pt-6">
                    <PaymentsTable 
                        data={data}
                        isLoading={isLoading}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
}