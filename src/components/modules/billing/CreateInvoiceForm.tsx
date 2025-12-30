"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Save,
  Loader2,
  Building2,
  User,
  Search,
  Mail,
  IdCard,
  RefreshCcw,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import useGetBranch from "@/hooks/branches/useGetBranch";
import { useExchangeRate } from "@/hooks/billing/useExchangeRate";
import { mainCurrencies } from "@vitalfit/sdk";

export interface InvoiceItem {
  item_id: string;
  item_type: string;
  quantity: number;
}

interface CreateInvoiceFormProps {
  token: string | null;
  branches: any[];
  memberships: any[];
  packages: any[];
  userData: any | null;
  paymentMethods: any[];
  loadingMethods: boolean;
  loadingMems: boolean;
  loadingPkgs: boolean;
  loadingTax?: boolean;
  taxRate?: { rate: number; name: string } | null;
  isSubmitting: boolean;
  isSearchingUser: boolean;
  canSelectBranch: boolean;
  onSearchUser: (email: string) => void;
  onBranchChange?: (branchId: string) => void;
  onSubmit: (
    branchId: string,
    items: InvoiceItem[],
    paymentMethodId: string,
    totalUSD: number,
    amountPaid: number,
    currencyPaid: string
  ) => void;
  onCancel: () => void;
  initialBranchId?: string;
}

export function CreateInvoiceForm({
  token,
  branches,
  memberships,
  packages,
  userData,
  paymentMethods = [],
  loadingMethods,
  loadingTax,
  taxRate,
  isSubmitting,
  isSearchingUser,
  canSelectBranch,
  onSearchUser,
  onBranchChange,
  onSubmit,
  onCancel,
  initialBranchId,
}: CreateInvoiceFormProps) {
  const t = useTranslations("finance.Billing");
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(
    initialBranchId || ""
  );
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [items, setItems] = useState<InvoiceItem[]>([
    { item_id: "", item_type: "membership", quantity: 1 },
  ]);

  const { rate: exchangeRate, isLoading: loadingRate } = useExchangeRate(
    token,
    displayCurrency
  );

  const { branchDetail, loading: loadingBranch } = useGetBranch(
    !canSelectBranch ? initialBranchId : undefined,
    token
  );

  const client = userData?.data;

  const { subtotal, taxAmount, totalUSD } = useMemo(() => {
    const sub = items.reduce((acc, item) => {
      const list = item.item_type === "membership" ? memberships : packages;
      const key =
        item.item_type === "membership" ? "membership_type_id" : "packageId";
      const product = list.find((p: any) => p[key] === item.item_id);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);

    const tax = sub * (taxRate?.rate || 0);
    return { subtotal: sub, taxAmount: tax, totalUSD: sub + tax };
  }, [items, memberships, packages, taxRate]);

  const totalConverted = useMemo(() => {
    if (displayCurrency === "USD") {
      return totalUSD;
    }
    return Math.round(totalUSD * (exchangeRate || 0) * 100) / 100;
  }, [totalUSD, exchangeRate, displayCurrency]);

  const currencyInfo = useMemo(
    () => mainCurrencies.find((c: any) => c.code === displayCurrency),
    [displayCurrency]
  );

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    setItems(next);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-lg border bg-card p-5 space-y-6 shadow-sm">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-primary" />{" "}
              {t("form.branch")}
            </label>
            {canSelectBranch ? (
              <Select
                value={selectedBranchId}
                onValueChange={(id: string) => {
                  setSelectedBranchId(id);
                  onBranchChange?.(id);
                }}
              >
                <SelectTrigger className="h-9 bg-muted/20 border-none shadow-none text-xs">
                  <SelectValue placeholder={t("form.selectBranch")} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {branches.map((b: any) => (
                    <SelectItem key={b.branch_id} value={b.branch_id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-9 rounded-md bg-muted/30 border px-3 flex items-center text-xs font-medium">
                {loadingBranch ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  branchDetail?.name
                )}
              </div>
            )}
          </div>

          <Separator className="opacity-50" />
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" /> {t("form.client")}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder={t("form.emailPlaceholder")}
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), onSearchUser(emailSearch))
                }
                className="h-9 text-xs"
              />
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 shrink-0"
                onClick={() => onSearchUser(emailSearch)}
                disabled={isSearchingUser}
              >
                {isSearchingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {client ? (
              <div className="rounded-lg border bg-muted/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={client.profile_picture_url} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {client.first_name?.[0]}
                      {client.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate leading-none mb-1">
                      {client.first_name} {client.last_name}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 font-bold uppercase tracking-tighter bg-background"
                    >
                      {client.role_name}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-dashed">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Mail className="h-3 w-3" /> {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <IdCard className="h-3 w-3" /> {client.identity_document}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-20 border border-dashed rounded-lg flex flex-col items-center justify-center grayscale opacity-40">
                <p className="text-[10px] font-medium uppercase tracking-tighter">
                  {t("form.waitingClient")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/20 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("form.concepts")}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[10px] font-bold hover:text-primary"
              onClick={() =>
                setItems([
                  ...items,
                  { item_id: "", item_type: "membership", quantity: 1 },
                ])
              }
            >
              <Plus className="h-3 w-3 mr-1" /> {t("form.addItem")}
            </Button>
          </div>
          <div className="p-5 space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 items-center animate-in fade-in duration-300"
              >
                <div className="flex-1 grid grid-cols-12 gap-2 p-1 bg-muted/10 rounded-md border border-transparent hover:border-muted-foreground/10 transition-all">
                  <Select
                    value={item.item_type}
                    onValueChange={(v: string) =>
                      updateItem(index, { item_type: v, item_id: "" })
                    }
                  >
                    <SelectTrigger className="col-span-3 h-8 border-none bg-transparent shadow-none text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectItem value="membership">
                        {t("form.membership")}
                      </SelectItem>
                      <SelectItem value="package">
                        {t("form.package")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={item.item_id}
                    onValueChange={(v: string) =>
                      updateItem(index, { item_id: v })
                    }
                  >
                    <SelectTrigger className="col-span-7 h-8 border-none bg-transparent shadow-none text-xs">
                      <SelectValue placeholder={t("form.selectProduct")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {item.item_type === "membership"
                        ? memberships.map((m: any) => (
                            <SelectItem
                              key={m.membership_type_id}
                              value={m.membership_type_id}
                            >
                              {m.name}
                            </SelectItem>
                          ))
                        : packages.map((p: any) => (
                            <SelectItem key={p.packageId} value={p.packageId}>
                              {p.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, {
                        quantity: Number(e.target.value) || 1,
                      })
                    }
                    className="col-span-2 h-8 border-none bg-background/50 text-center text-xs font-bold"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground/20 hover:text-destructive"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    {t("form.currency")}
                  </span>
                  <Select
                    value={displayCurrency}
                    onValueChange={setDisplayCurrency}
                  >
                    <SelectTrigger className="h-9 bg-muted/20 border-none font-bold text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {mainCurrencies.map((c: any) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    {t("form.paymentMethod")}
                  </span>
                  <Select
                    value={selectedPaymentMethodId}
                    onValueChange={setSelectedPaymentMethodId}
                    disabled={loadingMethods}
                  >
                    <SelectTrigger className="h-9 bg-muted/20 border-none font-bold text-xs">
                      <SelectValue placeholder={t("form.choose")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {paymentMethods.map((m: any) => (
                        <SelectItem
                          key={m.method_id || m.payment_method_id}
                          value={m.method_id || m.payment_method_id}
                        >
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {displayCurrency !== "USD" && (
                <div className="flex items-center gap-2 p-2.5 rounded-md border border-primary/10 bg-muted/30 text-[10px] font-bold text-primary italic">
                  <RefreshCcw
                    className={`h-3 w-3 ${loadingRate ? "animate-spin" : ""}`}
                  />
                  {t("form.exchangeRate", {
                    rate: exchangeRate?.toFixed(4) || "...",
                    currency: displayCurrency,
                  })}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 text-right space-y-3">
              <div className="space-y-1.5 border-b border-dashed pb-3">
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>{t("form.subtotal")}</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>{taxRate?.name || t("form.taxes")}</span>
                  <span className="font-medium text-destructive">
                    +${taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 leading-none mb-1">
                  {t("form.totalCharge")}
                </p>
                <h2 className="text-5xl font-bold tracking-tighter tabular-nums leading-none">
                  ${totalUSD.toFixed(2)}
                </h2>

                {displayCurrency !== "USD" && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 text-primary animate-in slide-in-from-right-2">
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                      {t("form.equivalentTo")}
                    </span>
                    <span className="text-sm font-black tracking-tight">
                      {loadingRate
                        ? "..."
                        : `${currencyInfo?.symbol} ${totalConverted.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${displayCurrency}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs h-10 px-6 font-bold uppercase tracking-tight"
            >
              {t("form.cancel")}
            </Button>
            <Button
              size="lg"
              disabled={
                isSubmitting ||
                !client ||
                totalUSD === 0 ||
                (loadingRate && displayCurrency !== "USD") ||
                !selectedPaymentMethodId
              }
              onClick={() =>
                onSubmit(
                  selectedBranchId,
                  items,
                  selectedPaymentMethodId,
                  totalUSD,
                  totalConverted,
                  displayCurrency
                )
              }
              className="px-10 h-10 text-xs font-black uppercase tracking-widest shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("form.finishSale")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
