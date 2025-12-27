"use client";

import React, { useState } from "react";
import { 
  Plus, Loader2, Hash, 
  Banknote, Landmark, CreditCard, Wallet 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";

import { useBranchPaymentMethods } from "@/hooks/branches/useBranchPaymentMethods";
import { usePaymentMethods } from "@/hooks/payment-methods/usePaymentMethods";

export function AddPaymentDialog({ invoiceId, onPaymentAdded, defaultAmount = 0 }: { invoiceId: string, onPaymentAdded: () => void, defaultAmount?: number }) {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const branchId = user?.activeBranch?.id;

  const branchData = useBranchPaymentMethods(branchId, token);
  const globalData = usePaymentMethods(branchId ? null : token);

  const methods = branchId ? branchData.methods : globalData.methods;
  const isLoading = branchId ? branchData.loading : globalData.loading;

  const getMethodIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "cash": return <Banknote className="h-4 w-4 text-emerald-500" />;
      case "transfer": return <Landmark className="h-4 w-4 text-blue-500" />;
      case "card": return <CreditCard className="h-4 w-4 text-indigo-500" />;
      default: return <Wallet className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMethod) {
      return toast.error("Selecciona un método de pago");
    }

    const formData = new FormData(e.currentTarget);
    const payload = {
      invoice_id: invoiceId,
      branch_id: branchId || null,
      amount_paid: Number(formData.get("amount_paid")),
      currency_paid: "USD", 
      payment_method_id: selectedMethod, 
      transaction_id: formData.get("transaction_id") as string,
      receipt_url: "Pago reportado por SuperAdmin", 
    };

    try {
      setIsSubmitting(true);
      await api.billing.AddPaymentToInvoice(payload, token!);
      toast.success("Pago registrado con éxito");
      setOpen(false);
      setSelectedMethod(""); 
      onPaymentAdded();
    } catch (error: any) {
      toast.error(error.message || "Error al procesar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSelectedMethod("");
    }
  } ;

  return (
    <Dialog open={open} onOpenChange={(v) => { handleOpenChange(v);}}>
      <DialogTrigger asChild>
        <Button className="w-full shadow-sm" size="sm">
          <Plus className="h-4 w-4 mr-2" /> Registrar Pago
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-slate-50 p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">
                {branchId ? "Registrar Cobro" : "Cobro Super Administrador"}
              </DialogTitle>
              <DialogDescription className="font-medium italic text-slate-500">
                {branchId ? `Sede: ${user?.activeBranch?.name}` : "Gestión Global de Pagos"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Monto (USD)</Label>
              <Input
                name="amount_paid"
                type="number"
                step="0.01"
                className="h-14 text-2xl font-black bg-slate-50 border-slate-200 rounded-xl px-4 focus-visible:ring-primary"
                defaultValue={defaultAmount > 0 ? defaultAmount.toFixed(2) : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Método de Recepción</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod} required>
                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un método"} />
                </SelectTrigger>
                
                <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[280px] overflow-y-auto">
                  {methods.length > 0 ? (
                    methods.map((method) => {
                      const mId = method.method_id || method.payment_method_id; 
                      return (
                        <SelectItem key={mId} value={mId} className="cursor-pointer py-3 focus:bg-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-lg border shadow-sm flex items-center justify-center w-8 h-8">
                              {getMethodIcon(method.type)}
                            </div>
                            <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                              {method.name}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No se encontraron métodos de pago
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Referencia</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  name="transaction_id"
                  className="pl-10 h-11 bg-slate-50 border-slate-200 uppercase font-mono text-sm rounded-xl focus-visible:ring-primary"
                  placeholder="ID DE TRANSACCIÓN"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-6 border-t gap-3 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || isLoading || !selectedMethod} className="min-w-[150px] font-bold shadow-md rounded-xl">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirmar Cobro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}