"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Save,
  Package,
  Loader2,
  Building2,
  User,
  Search,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useGetBranch from "@/hooks/branches/useGetBranch";
import { useAuth } from "@/context/AuthContext";

export interface InvoiceItem {
  item_id: string;
  item_type: string;
  quantity: number;
  price: number;
}

interface CreateInvoiceFormProps {
  branches: any[];
  memberships: any[];
  packages: any[];
  userData: any | null;
  paymentMethods: any[];
  loadingMethods: boolean;
  loadingMems: boolean;
  loadingPkgs: boolean;
  isSubmitting: boolean;
  isSearchingUser: boolean;
  canSelectBranch: boolean;
  onSearchUser: (email: string) => void;
  onSubmit: (
    branchId: string,
    items: InvoiceItem[],
    paymentMethodId: string,
    total: number
  ) => void;
  onCancel: () => void;
  initialBranchId?: string;
}

export function CreateInvoiceForm({
  branches,
  memberships,
  packages,
  userData,
  paymentMethods = [],
  loadingMethods,
  loadingMems,
  loadingPkgs,
  isSubmitting,
  isSearchingUser,
  canSelectBranch,
  onSearchUser,
  onSubmit,
  onCancel,
  initialBranchId,
}: CreateInvoiceFormProps) {
  const { token } = useAuth();

  const [emailSearch, setEmailSearch] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(
    initialBranchId || ""
  );

  const { branchDetail, loading: loadingBranch } = useGetBranch(
    !canSelectBranch ? initialBranchId : undefined,
    token
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    { item_id: "", item_type: "membership", quantity: 1, price: 0 },
  ]);

  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      let price = 0;

      if (item.item_type === "membership") {
        price =
          memberships.find(
            (m) => m.membership_type_id === item.item_id
          )?.price || 0;
      } else {
        price =
          packages.find((p) => p.packageId === item.item_id)?.price || 0;
      }

      return acc + price * item.quantity;
    }, 0);
  }, [items, memberships, packages]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };

    if (updates.item_id || updates.item_type) {
      if (next[index].item_type === "membership") {
        next[index].price =
          memberships.find(
            (m) => m.membership_type_id === next[index].item_id
          )?.price || 0;
      } else {
        next[index].price =
          packages.find((p) => p.packageId === next[index].item_id)?.price || 0;
      }
    }

    setItems(next);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-12">
      <div className="xl:col-span-4 space-y-6">
        <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Sucursal
          </div>

          {canSelectBranch ? (
            <Select
              value={selectedBranchId}
              onValueChange={setSelectedBranchId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-11 rounded-xl bg-muted/40 border">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.branch_id} value={b.branch_id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-11 rounded-xl bg-muted/40 border px-4 flex items-center text-sm font-medium">
              {loadingBranch ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                branchDetail?.name
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <User className="h-4 w-4 text-primary" />
            Cliente
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Email del cliente"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), onSearchUser(emailSearch))
              }
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-muted/40"
            />
            <Button
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={() => onSearchUser(emailSearch)}
              disabled={isSearchingUser || isSubmitting}
            >
              {isSearchingUser ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {userData && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-sm font-semibold">
                {userData.first_name} {userData.last_name}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {userData.email}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ID: {userData.identity_document}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="xl:col-span-8 space-y-6">
        {/* Items */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4 text-primary" />
              Conceptos
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItems([
                  ...items,
                  { item_id: "", item_type: "membership", quantity: 1, price: 0 },
                ])
              }
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border bg-muted/30 p-4 flex items-center gap-3"
              >
                <div className="grid grid-cols-12 gap-2 flex-1">
                  <div className="col-span-3">
                    <Select
                      value={item.item_type}
                      onValueChange={(v) =>
                        updateItem(index, { item_type: v, item_id: "" })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-lg bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membership">Membresía</SelectItem>
                        <SelectItem value="package">Paquete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-7">
                    <Select
                      value={item.item_id}
                      onValueChange={(v) => updateItem(index, { item_id: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg bg-background text-xs">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {item.item_type === "membership"
                          ? memberships.map((m) => (
                              <SelectItem
                                key={m.membership_type_id}
                                value={m.membership_type_id}
                              >
                                {m.name}
                              </SelectItem>
                            ))
                          : packages.map((p) => (
                              <SelectItem key={p.packageId} value={p.packageId}>
                                {p.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="h-10 rounded-lg bg-background text-center"
                    />
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setItems(items.filter((_, i) => i !== index))
                  }
                  disabled={items.length === 1}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-6 space-y-6">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Wallet className="h-4 w-4 text-primary" />
            Método de cobro
          </div>

          <Select
            value={selectedPaymentMethodId}
            onValueChange={setSelectedPaymentMethodId}
            disabled={isSubmitting || loadingMethods}
          >
            <SelectTrigger className="h-12 rounded-xl bg-background">
              <SelectValue placeholder="Seleccionar método" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((m) => (
                <SelectItem
                  key={m.method_id || m.payment_method_id}
                  value={m.method_id || m.payment_method_id}
                >
                  {m.display_name || m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between rounded-2xl border bg-primary/5 p-6">
            <div>
              <p className="text-xs font-semibold uppercase text-primary/80">
                Total a pagar
              </p>
              <p className="text-4xl font-black text-primary">
                {formatCurrency(total)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
      
                disabled={
                  isSubmitting ||
                  !userData ||
                  !selectedBranchId ||
                  !selectedPaymentMethodId ||
                  total === 0
                }
                onClick={() =>
                  onSubmit(
                    selectedBranchId,
                    items,
                    selectedPaymentMethodId,
                    total
                  )
                }
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Emitir y cobrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
