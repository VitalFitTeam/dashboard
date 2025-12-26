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
import { CreateInvoiceForm, type InvoiceItem } from "@/components/modules/billing/CreateInvoiceForm";
import { useRouter } from "@/i18n/navigation";


export default function StaffNewInvoicePage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getUserByEmail, userData, loading: searchingUser } = useUserByEmail(token ?? "");
  const { branches } = useBranches({ token: token ?? "", limit: 100 });
  const { memberships, loading: loadingMems } = useMembershipTypes({ token: token ?? "", initialLimit: 50 });
  const { packages, loading: loadingPkgs } = usePackages({ token: token ?? "" });

  const handleCreateInvoice = async (branchId: string, items: InvoiceItem[]) => {
    if (!token || !userData) {
         return toast.error("Completa todos los conceptos");
    }
    if (items.some(i => !i.item_id)){
         return toast.error("Completa todos los conceptos");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        branch_id: branchId,
        user_id: userData.user_id,
        items: items.map(item => ({ ...item, quantity: Number(item.quantity) })),
      };
      console.log("Payload de la factura:", payload);
      await api.billing.createInvoice(payload, token);
      toast.success("Factura generada exitosamente");
      router.push("/finance/billing");
    } catch (error: any) {
      toast.error("Error al procesar la venta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Nueva Venta" subtitle="Genera cargos directos a la cuenta del usuario." />
      </div>

      <CreateInvoiceForm
        branches={branches}
        memberships={memberships}
        packages={packages}
        userData={userData}
        loadingMems={loadingMems}
        loadingPkgs={loadingPkgs}
        isSubmitting={isSubmitting}
        isSearchingUser={searchingUser}
        onSearchUser={getUserByEmail}
        onSubmit={handleCreateInvoice}
        onCancel={() => router.back()}
        canSelectBranch={!user?.activeBranch?.id}
        initialBranchId={user?.activeBranch?.id}
      />
    </div>
  );
}