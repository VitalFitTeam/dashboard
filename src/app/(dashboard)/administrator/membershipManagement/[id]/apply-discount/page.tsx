"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { mockMembershipPayments, MembershipPayment } from "../../data";
import { Badge } from "@/components/ui/badge";

export default function ApplyDiscountPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<MembershipPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    discount_type: "",
    discount_amount: "",
  });

  useEffect(() => {
    const foundPayment = mockMembershipPayments.find(p => p.payment_id === params.id);
    if (foundPayment) {
      setPayment(foundPayment);
    }
  }, [params.id]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!payment){return;}

    setIsSubmitting(true);
    
    try {
      console.warn("Aplicando descuento:", { payment, formData });
      
      router.push("/administrator/membershipManagement");
    } catch (error) {
      console.error("Error aplicando descuento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="text-center p-10">Pago no encontrado</div>
      </div>
    );
  }

  const originalAmount = parseFloat(payment.original_amount?.replace("$", "").replace(" USD", "") || "0");
  const discountAmount = parseFloat(formData.discount_amount) || 0;
  const newTotal = originalAmount - discountAmount;

  const StatusBadge = ({ status }: { status: MembershipPayment["status"] }) => {
    const variantMap = {
      completed: "default",
      failed: "destructive",
      refunded: "outline",
      pending: "secondary"
    };

    const labels = {
      completed: "Completado",
      failed: "Fallido",
      refunded: "Reembolsado",
      pending: "Pendiente"
    };

    return (
      <Badge variant={variantMap[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader 
        title="APLICAR DESCUENTO"
        subtitle={`Modifica el precio de la membresía para ${payment.client}`}
      />

      <div className="p-6 space-y-8">
        <div className="bg-white rounded-lg border p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">ID de Pago</label>
            <span>{payment.invoice} </span>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Nombre del Miembro</label>
            <span>{payment.client}</span>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Monto original</label>
            <span>{payment.original_amount || ""}</span>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Estado Actual</label>
            <div className="w-1/2">
            <StatusBadge status={payment.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Membresía Adquirida</label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder={payment.membership_name || "Select an Item"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={payment.membership_name || ""}>
                  {payment.membership_name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">ID Fiscal</label>
            <Input value="E-MAIL" disabled />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Tipo de descuento</label>
          <Select
            value={formData.discount_type}
            onValueChange={(value) => handleChange("discount_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar descuento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Porcentaje (%)</SelectItem>
              <SelectItem value="fixed">Monto fijo ($)</SelectItem>
              <SelectItem value="promotional">Promocional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{payment.original_amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento</span>
              <span>${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Nuevo Total a pagar</span>
              <span>${newTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {formData.discount_type && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">
              {formData.discount_type === "percentage" ? "Porcentaje de descuento (%)" : "Monto de descuento ($)"}
            </label>
            <Input
              type="number"
              value={formData.discount_amount}
              onChange={(e) => handleChange("discount_amount", e.target.value)}
              placeholder={formData.discount_type === "percentage" ? "0" : "0.00"}
            />
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/administrator/membershipManagement")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Aplicando..." : "Aplicar descuento"}
          </Button>
        </div>
      </div>
    </div>
  );
}