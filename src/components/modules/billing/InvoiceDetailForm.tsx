"use client";

import React from "react";
import {
  FileText,
  CreditCard,
  Mail,
  ShieldCheck,
  User as UserIcon,
  MapPin,
  Receipt,
  ArrowUpRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { InvoiceItemsTable } from "./InvoiceItemsTable";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import { AddPaymentDialog } from "./AddPaymentDialog";

interface InvoiceDetailFormProps {
  invoice: any;
  user: any;
  userLoading: boolean;
  onRefresh: () => void;
  pendingAmount: number;
  branchName?: string;
}

export function InvoiceDetailForm({
  invoice,
  user,
  userLoading,
  onRefresh,
  pendingAmount,
  branchName,
}: InvoiceDetailFormProps) {
  const isPaid = invoice.status === "Paid";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
      {/* SECCIÓN IZQUIERDA: TABLAS DE DETALLE */}
      <div className="lg:col-span-8 space-y-8">
        {/* CONCEPTOS FACTURADOS */}
        <section className="space-y-4">
          <header className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Detalle de Conceptos
                </h2>
                <p className="text-xs text-muted-foreground">
                  Desglose de productos y servicios adquiridos
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono">
              {invoice.invoice_items?.length || 0} ítems
            </Badge>
          </header>

          <Card className="border-border shadow-sm overflow-hidden bg-card/50">
            <CardContent className="p-0">
              <InvoiceItemsTable items={invoice.invoice_items || []} />
            </CardContent>
          </Card>
        </section>

        {/* HISTORIAL DE TRANSACCIONES */}
        <section className="space-y-4">
          <header className="flex items-center gap-2.5 px-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Registro de Pagos
              </h2>
              <p className="text-xs text-muted-foreground">
                Historial completo de abonos y transacciones
              </p>
            </div>
          </header>

          <Card className="border-border shadow-sm overflow-hidden bg-card/50">
            <CardContent className="p-0">
              {/* La resolución del método de pago ocurre internamente en esta tabla */}
              <PaymentHistoryTable payments={invoice.payments || []}  onRefresh={onRefresh}/>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ASIDE DERECHA: RESUMEN Y CLIENTE */}
      <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
        
        {/* CARD DE RESUMEN FINANCIERO */}
        <Card className="rounded-2xl border-primary/10 shadow-xl shadow-primary/5 bg-gradient-to-b from-card to-background overflow-hidden">
          <div className={`h-1.5 w-full ${isPaid ? "bg-green-500" : "bg-warning"}`} />

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Estado de Cobro
              </span>
              <Badge
                variant={isPaid ? "success" : "warning"}
                className="px-3 py-1 font-bold shadow-sm"
              >
                {isPaid ? "CONCILIADO" : "PENDIENTE"}
              </Badge>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono tracking-tighter text-foreground">
                ${Number(invoice.total_amount || 0).toLocaleString()}
              </span>
              <span className="text-sm font-bold text-muted-foreground">USD</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-xl border border-border/50">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Subtotal</p>
                <p className="text-sm font-mono font-semibold">
                  ${Number(invoice.sub_total || 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Impuestos</p>
                <p className="text-sm font-mono font-semibold text-orange-600">
                  +${Number(invoice.tax || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {!isPaid && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-destructive">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                    <Receipt className="h-3.5 w-3.5" />
                    Deuda Actual
                  </div>
                  <span className="text-xl font-black font-mono tracking-tighter animate-pulse">
                    ${pendingAmount.toFixed(2)}
                  </span>
                </div>

                <AddPaymentDialog
                  invoiceId={invoice.invoice_id}
                  onPaymentAdded={onRefresh}
                  defaultAmount={pendingAmount}
                />
              </div>
            )}

            {isPaid && (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                FACTURA TOTALMENTE PAGADA
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD DE INFORMACIÓN DEL CLIENTE */}
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              Información de Cuenta
              <ArrowUpRight className="h-3 w-3 opacity-30" />
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {userLoading ? "Cargando..." : `${user?.first_name} ${user?.last_name}`}
                </p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="h-3 w-3 opacity-60" />
                  ID: {user?.identity_document || "N/A"}
                </p>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Sede Emisión
                </span>
                <Badge variant="outline" className="text-[10px] border-primary/20 text-primary uppercase">
                  {branchName || "Principal"}
                </Badge>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/40 cursor-help group transition-colors hover:bg-muted">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex justify-between">
                        UUID de Factura
                        <span className="group-hover:text-primary transition-colors text-[8px]">INFO</span>
                      </p>
                      <p className="text-[10px] font-mono text-foreground break-all leading-tight opacity-50 italic">
                        {invoice.invoice_id}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Identificador único de sistema</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}