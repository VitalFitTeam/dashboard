"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSalesByCategory } from "@/hooks/useReports";
import { ReusableDonutChart } from "../charts/donut-chart";

type ServiceSalesDonutChartProps = {
    startDate?: string;
    endDate?: string;
    token: string;
};

export default function CategorySalesDonutChart({
    startDate,
    endDate,
    token,
}: ServiceSalesDonutChartProps) {
    const {
        data: salesCategory,
        isLoading: isLoadingSales,
        error: errorSales,
    } = useSalesByCategory(token || "", startDate || "", endDate || "");

    if (errorSales) {
        return (
            <Card className="h-[400px]">
                <CardHeader>
                    <CardTitle>Ventas por Servicio</CardTitle>
                </CardHeader>
                <CardContent className="text-red-500">
                    Error al cargar datos de servicios.
                </CardContent>
            </Card>
        );
    }

    if (isLoadingSales || !salesCategory) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }
    const serviceGrowth = 8.5;

    return (
        <ReusableDonutChart
            title="Ventas por Servicio"
            description="Distribución de Ingresos por tipo"
            data={salesCategory}
            dataKey="value"
            labelKey="label"
            growth={serviceGrowth}
            footerText={`Total: ${salesCategory.length}`}
        />
    );
}
