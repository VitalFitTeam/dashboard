"use client";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { useTranslations } from "next-intl"; 
import PaymentsTable from "@/components/modules/clients/PaymentsTable";

export default function ClientPaymentsPage() {
    const params = useParams();
    const t = useTranslations("clients.payments"); 
    
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
                title={t("title")} 
                subtitle={t("subtitle")} 
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