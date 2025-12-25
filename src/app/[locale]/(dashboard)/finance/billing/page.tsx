"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useInvoices } from "@/hooks/billing/use-invoices";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { InvoiceTable } from "@/components/modules/billing/InvoiceTable";

export default function BillingPage() {
    const router = useRouter();

    const { token } = useAuth();

    if (!token) {
        return;
    }

    const {
        data,
        loading,
        totalPages,
        filters,
        updateFilters,
        changePage,
        refresh
    } = useInvoices(token);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-start">
                <PageHeader
                    title="Facturas y Pagos."
                    subtitle="Administra tus facturas y métodos de pago aquí."
                />
                <Button onClick={() => router.push("/billing/new")}>
                    <Plus className="h-4 w-4 mr-2" /> Nueva Factura
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por cliente o número..."
                        className="pl-10"
                        onChange={(e) => updateFilters({ search: e.target.value })}
                    />
                </div>

                <Select
                    onValueChange={(v) =>
                        updateFilters({ status: v === "all" ? undefined : (v as any) })
                    }
                >
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Estado de factura" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Paid">Pagado</SelectItem>
                        <SelectItem value="Unpaid">Pendiente</SelectItem>
                        <SelectItem value="Overdue">Vencido</SelectItem>
                        <SelectItem value="Void">Anulado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <InvoiceTable
                data={data}
                isLoading={loading}
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={changePage}
                onActionSuccess={refresh}
            />
        </div>
    );
}