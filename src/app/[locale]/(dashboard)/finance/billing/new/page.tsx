"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/branches/useBranches";
import { useUserByEmail } from "@/hooks/users/useUserByEmail";
import { usePackages } from "@/hooks/packages/usePackages";
import { useMembershipTypes } from "@/hooks/membership/useMembershipTypes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/sdk-config";
import {
  CreateInvoiceForm,
  type InvoiceItem,
} from "@/components/modules/billing/CreateInvoiceForm";
import { useRouter } from "@/i18n/navigation";
import { useBranchPaymentMethods } from "@/hooks/branches/useBranchPaymentMethods";
import { usePaymentMethods } from "@/hooks/payment-methods/usePaymentMethods";

export default function StaffNewInvoicePage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchId = user?.activeBranch?.id;
  
  const branchData = useBranchPaymentMethods(branchId ?? "", token ?? "");
  const globalData = usePaymentMethods(branchId ? "" : (token ?? ""));

  const paymentMethods = branchId ? branchData.methods : globalData.methods;
  const loadingMethods = branchId ? branchData.loading : globalData.loading;

  const {
    getUserByEmail,
    userData,
    loading: searchingUser,
  } = useUserByEmail(token ?? "");
  
  const { branches } = useBranches({ token: token ?? "", limit: 100 });
  const { memberships, loading: loadingMems } = useMembershipTypes({
    token: token ?? "",
    initialLimit: 50,
  });
  const { packages, loading: loadingPkgs } = usePackages({
    token: token ?? "",
  });

  const handleCreateInvoice = async (
    targetBranchId: string,
    items: InvoiceItem[],
    paymentMethodId: string,
    totalAmount: number
  ) => {
    if (!token || !userData) {
      return toast.error("Debe seleccionar un usuario primero");
    }

    setIsSubmitting(true);
    let createdInvoiceId = null;

    try {
      const invoicePayload = {
        branch_id: targetBranchId,
        user_id: userData.user_id,
        items: items.map((item) => ({
          item_id: item.item_id,
          item_type: item.item_type,
          quantity: Number(item.quantity),
        })),
      };

      const invoiceRes = await api.billing.createInvoice(invoicePayload, token);
      createdInvoiceId = invoiceRes.invoice_id;

      const paymentPayload = {
        invoice_id: createdInvoiceId,
        amount_paid: totalAmount,
        currency_paid: "USD", 
        payment_method_id: paymentMethodId,
        transaction_id: `STAFF-${user?.user_id || "UID"}-${Date.now()}`,
        receipt_url: "",
      };

      await api.billing.AddPaymentToInvoice(paymentPayload, token);

      toast.success("Venta completada y pagada exitosamente");
      router.push("/finance/billing");
    } catch (error: any) {
      console.error("Error en el flujo de venta:", error);
      if (createdInvoiceId) {
        toast.error("Factura creada, pero el pago falló. Redirigiendo...");
        router.push(`/finance/billing/${createdInvoiceId}/pay`);
      } else {
        toast.error("Error al generar la factura");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">

        <PageHeader
          title="Nueva Venta"
          subtitle="Genera cargos y procesa el pago en un solo paso."
        />
      </div>

      <CreateInvoiceForm
        branches={branches}
        memberships={memberships}
        packages={packages}
        userData={userData}
        paymentMethods={paymentMethods} 
        loadingMethods={loadingMethods} 
        loadingMems={loadingMems}
        loadingPkgs={loadingPkgs}
        isSubmitting={isSubmitting}
        isSearchingUser={searchingUser}
        onSearchUser={getUserByEmail}
        onSubmit={handleCreateInvoice}
        onCancel={() => router.back()}
        canSelectBranch={!branchId} 
        initialBranchId={branchId}
      />
    </div>
  );
}