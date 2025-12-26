"use client";

import React, { useState } from "react";
import { Plus, Loader2, DollarSign, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

interface AddPaymentDialogProps {
  invoiceId: string;
  onPaymentAdded: () => void;
  defaultAmount?: number; 
}

export function AddPaymentDialog({ 
  invoiceId, 
  onPaymentAdded, 
  defaultAmount = 0 
}: AddPaymentDialogProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      invoice_id: invoiceId,
      amount_paid: Number(formData.get("amount_paid")),
      currency_paid: "USD",
      payment_method_id: formData.get("payment_method_id") as string,
      transaction_id: formData.get("transaction_id") as string,
      receipt_url: "Pago reportado en sitio", // Simplificado
    };

    try {
      setIsSubmitting(true);
      await api.billing.AddPaymentToInvoice(payload, token!);
      
      toast.success("Pago registrado con éxito");
      setOpen(false);
      onPaymentAdded(); 
    } catch (error: any) {
      toast.error(error.message || "Error al registrar pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Registrar Cobro</DialogTitle>
            <DialogDescription>
              Selecciona el método y el monto para saldar esta factura.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Monto */}
            <div className="grid gap-2">
              <Label htmlFor="amount_paid" className="text-xs font-bold uppercase">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount_paid"
                  name="amount_paid"
                  type="number"
                  step="0.01"
                  className="pl-9 font-mono"
                  defaultValue={defaultAmount > 0 ? defaultAmount.toFixed(2) : ""}
                  required
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div className="grid gap-2">
              <Label htmlFor="payment_method_id" className="text-xs font-bold uppercase">Método</Label>
              <Select name="payment_method_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="91864b67-6f76-4c8f-8925-5c362de89890">Tarjeta (Sitio)</SelectItem>
                  <SelectItem value="cash_id">Efectivo</SelectItem>
                  <SelectItem value="transfer_id">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Referencia */}
            <div className="grid gap-2">
              <Label htmlFor="transaction_id" className="text-xs font-bold uppercase">Referencia</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transaction_id"
                  name="transaction_id"
                  className="pl-9 font-mono"
                  placeholder="ID de operación"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}