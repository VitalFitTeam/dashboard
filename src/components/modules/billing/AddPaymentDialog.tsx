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

    // Payload ajustado estrictamente al modelo POST /billing/invoices/payment
    const payload = {
      invoice_id: invoiceId,
      amount_paid: Number(formData.get("amount_paid")),
      currency_paid: "USD", // Moneda base del sistema
      payment_method_id: formData.get("payment_method_id") as string,
      transaction_id: formData.get("transaction_id") as string,
      receipt_url: "Pago reportado en sitio", 
    };

    try {
      setIsSubmitting(true);
      
      // Llamada al método correcto del SDK
      await api.billing.AddPaymentToInvoice(payload, token!);
      
      toast.success("Pago registrado con éxito");
      setOpen(false);
      onPaymentAdded(); // Refresca los detalles de la factura en el padre
    } catch (error: any) {
      console.error("Error al registrar pago:", error);
      toast.error(error.message || "No se pudo registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full shadow-sm" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Registrar Cobro</DialogTitle>
            <DialogDescription>
              Selecciona el método y el monto para saldar esta factura.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Monto con sugerencia automática */}
            <div className="grid gap-2">
              <Label htmlFor="amount_paid" className="text-xs font-bold uppercase text-muted-foreground">
                Monto a cobrar (USD)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount_paid"
                  name="amount_paid"
                  type="number"
                  step="0.01"
                  className="pl-9 font-mono"
                  defaultValue={defaultAmount > 0 ? defaultAmount.toFixed(2) : ""}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="grid gap-2">
              <Label htmlFor="payment_method_id" className="text-xs font-bold uppercase text-muted-foreground">
                Método de Recepción
              </Label>
              <Select name="payment_method_id" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="91864b67-6f76-4c8f-8925-5c362de89890">Tarjeta (Terminal Sitio)</SelectItem>
                  <SelectItem value="cash_id">Efectivo en Caja</SelectItem>
                  <SelectItem value="transfer_id">Transferencia Bancaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ID de Referencia */}
            <div className="grid gap-2">
              <Label htmlFor="transaction_id" className="text-xs font-bold uppercase text-muted-foreground">
                Número de Referencia
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transaction_id"
                  name="transaction_id"
                  className="pl-9 font-mono uppercase"
                  placeholder="Ej: BNK-8829"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                "Confirmar Pago"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}