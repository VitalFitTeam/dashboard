"use client";

import React from "react";
import {
  FileText,
  CreditCard,
  Info,
  Calendar,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { InvoiceItemsTable } from "./InvoiceItemsTable";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import { AddPaymentDialog } from "./AddPaymentDialog";

interface InvoiceDetailFormProps {
  invoice: any;
  user: any;
  userLoading: boolean;
  onRefresh: () => void;
  pendingAmount: number; // Nueva prop calculada en el padre
}

export function InvoiceDetailForm({
  invoice,
  user,
  userLoading,
  onRefresh,
  pendingAmount,
}: InvoiceDetailFormProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
      
      {/* SECCIÓN IZQUIERDA: DETALLES (8 COLUMNAS) */}
      <div className="lg:col-span-8 space-y-10">
        
        {/* CONCEPTOS FACTURADOS */}
        <section className="space-y-4">
          <header className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Conceptos facturados
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {invoice.invoice_items?.length || 0} ítems registrados
            </span>
          </header>

          <Card className="border-border shadow-sm overflow-hidden bg-card">
            <CardContent className="p-0">
              <InvoiceItemsTable items={invoice.invoice_items || []} />
            </CardContent>
          </Card>
        </section>

        {/* HISTORIAL DE TRANSACCIONES */}
        <section className="space-y-4">
          <header className="flex items-center gap-2 px-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Historial de transacciones
            </h2>
          </header>

          <Card className="border-border shadow-sm overflow-hidden bg-card">
            <CardContent className="p-0">
              <PaymentHistoryTable payments={invoice.payments || []} />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ASIDE DERECHA: RESUMEN Y CLIENTE (4 COLUMNAS) */}
      <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">

        {/* CARD DE RESUMEN FINANCIERO */}
        <Card className="rounded-xl border-border shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Resumen de Cuenta
              </CardTitle>
              <Badge
                variant={
                  invoice.status === "Paid" ? "success" : 
                  invoice.status === "Unpaid" ? "warning" : "error"
                }
                className="text-[10px] uppercase font-bold px-2.5 py-0.5"
              >
                {invoice.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Calendar className="h-3.5 w-3.5" />
              Emitida el {new Date(invoice.issue_date).toLocaleDateString()}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  ${Number(invoice.sub_total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span className="font-mono font-medium text-orange-600">
                  +${Number(invoice.tax || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Monto Total
                </p>
                <p className="text-3xl font-bold font-mono tracking-tighter text-foreground">
                  ${Number(invoice.total_amount || 0).toFixed(2)}
                </p>
              </div>

              {/* MUESTRA EL SALDO PENDIENTE SI EXISTE */}
              {pendingAmount > 0 && (
                <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-destructive uppercase tracking-tight">Saldo Pendiente:</span>
                    <span className="text-sm font-mono font-bold text-destructive">
                      ${pendingAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN DE ACCIÓN: Registrar Pago */}
            {invoice.status !== "Paid" && (
              <div className="pt-2">
                <AddPaymentDialog 
                   invoiceId={invoice.invoice_id} 
                   onPaymentAdded={onRefresh}
                   defaultAmount={pendingAmount} // Pasamos el monto sugerido al modal
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD DE INFORMACIÓN DEL CLIENTE */}
        <Card className="rounded-xl border-border shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <UserIcon className="h-3 w-3" />
              Información del Cliente
            </CardTitle>
          </CardHeader>

          <CardContent>
            {userLoading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-40 bg-muted rounded" />
                </div>
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name} {user.last_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <ShieldCheck className="h-3 w-3" />
                      Cuenta
                    </span>
                    <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold border-primary/20 text-primary bg-primary/5">
                      Verificado
                    </Badge>
                  </div>

                  <div className="bg-muted/50 p-2 rounded border border-border/40">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 tracking-tighter">ID Único (UID)</p>
                    <p className="text-[10px] font-mono text-foreground break-all leading-tight opacity-70">
                      {invoice.user_id}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 gap-2 border border-dashed rounded-lg">
                <p className="text-xs text-muted-foreground italic">Datos no disponibles</p>
                <span className="text-[10px] font-mono opacity-50 truncate w-full px-2 text-center">{invoice.user_id}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NOTA DE PIE */}
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-4 text-[11px] text-muted-foreground flex gap-3">
          <Info className="h-4 w-4 shrink-0 text-primary/60" />
          <p className="leading-relaxed italic">
            Documento contable generado por el sistema. Las transacciones registradas son auditadas automáticamente por VitalFit.
          </p>
        </div>
      </aside>
    </div>
  );
}