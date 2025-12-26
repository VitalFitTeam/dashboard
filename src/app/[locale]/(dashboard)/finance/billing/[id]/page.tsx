"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/PageHeader";

import { useAuth } from "@/context/AuthContext";
import { useGetUser } from "@/hooks/users/useGetUser";
import { api } from "@/lib/sdk-config";

import { InvoiceDetailForm } from "@/components/modules/billing/InvoiceDetailForm";
import useGetBranch from "@/hooks/branches/useGetBranch";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceDetails = useCallback(async () => {
    if (!id || !token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.billing.getInvoiceByID(id as string, token);

      if (response?.data) {
        setInvoice(response.data);
      } else {
        setError("No se encontraron datos para esta factura.");
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  const { user, loading: userLoading } = useGetUser(invoice?.user_id, token);
  const { branchDetail, loading: branchLoading } = useGetBranch(
    invoice?.branch_id,
    token
  );

  const financialSummary = useMemo(() => {
    if (!invoice) {
      return { totalPaid: 0, pendingAmount: 0 };
    }

    const totalAmount = Number(invoice.total_amount || 0);
    const totalPaid = (invoice.payments || []).reduce(
      (acc: number, p: any) => acc + Number(p.amount_paid || 0),
      0
    );

    return {
      totalPaid,
      pendingAmount: Math.max(0, totalAmount - totalPaid),
    };
  }, [invoice]);

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      <PageHeader
        title={
          invoice ? `Factura ${invoice.invoice_number}` : "Detalle de Factura"
        }
        subtitle={
          invoice ? (

            <span className="flex flex-col gap-1">
              <span>
                Emitida el {new Date(invoice.issue_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <MapPin className="h-3.5 w-3.5" />
                {branchLoading ? (
                  <span className="animate-pulse bg-muted h-3 w-24 rounded inline-block" />
                ) : (
                  <span>
                    {branchDetail?.name || "Sucursal no identificada"}
                  </span>
                )}
              </span>
            </span>
          ) : (
            "Consulta el desglose de conceptos."
          )
        }
        actionButton={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              disabled={loading || !!error}
            >
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button size="sm" disabled={loading || !!error}>
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          </div>
        }
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </PageHeader>

      <Separator className="my-6" />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Sistema</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 text-sm">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={fetchInvoiceDetails}
            >
              Reintentar Carga
            </Button>
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Sincronizando...
          </p>
        </div>
      ) : (
        <InvoiceDetailForm
          invoice={invoice}
          user={user}
          userLoading={userLoading}
          onRefresh={fetchInvoiceDetails}
          pendingAmount={financialSummary.pendingAmount}
          branchName={branchDetail?.name}
        />
      )}
    </div>
  );
}
