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
  IdCard,
  CheckCircle2,
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
import { Badge } from "@/components/ui/badge";

export interface InvoiceItem {
  item_id: string;
  item_type: string;
  quantity: number;
}

interface CreateInvoiceFormProps {
  branches: any[];
  memberships: any[];
  packages: any[];
  userData: any | null;
  loadingMems: boolean;
  loadingPkgs: boolean;
  isSubmitting: boolean;
  isSearchingUser: boolean;
  canSelectBranch: boolean;
  onSearchUser: (email: string) => void;
  onSubmit: (branchId: string, items: InvoiceItem[]) => void;
  onCancel: () => void;
  initialBranchId?: string;
}

export function CreateInvoiceForm({
  branches,
  memberships,
  packages,
  userData,
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
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(
    initialBranchId || ""
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    { item_id: "", item_type: "membership", quantity: 1 },
  ]);

  // --- CÁLCULO FINANCIERO EN TIEMPO REAL ---
  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      let price = 0;
      if (item.item_type === "membership") {
        const found = memberships.find(
          (m) => m.membership_type_id === item.item_id
        );
        price = found?.price || 0;
      } else if (item.item_type === "package") {
        const found = packages.find((p) => p.packageId === item.item_id);
        price = found?.price || 0;
      }
      return acc + price * item.quantity;
    }, 0);
  }, [items, memberships, packages]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  // --- MANEJADORES ---
  const handleAddItem = () =>
    setItems([...items, { item_id: "", item_type: "membership", quantity: 1 }]);

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase tracking-widest">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Sucursal de Venta</span>
          </div>
          {canSelectBranch ? (
            <Select
              value={selectedBranchId}
              onValueChange={setSelectedBranchId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full bg-slate-50 border-none">
                <SelectValue placeholder="Seleccionar sede" />
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
            <div className="p-3 bg-slate-50 rounded-lg border border-dashed text-sm font-medium text-muted-foreground">
              Sucursal predeterminada activa
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase tracking-widest">
            <User className="h-4 w-4 text-primary" />
            <span>Datos del Cliente</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Email del cliente..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), onSearchUser(emailSearch))
              }
              className="bg-slate-50 border-none shadow-none focus-visible:ring-1"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              size="icon"
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
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {userData.first_name[0]}
                  {userData.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold truncate">
                    {userData.first_name} {userData.last_name}
                  </p>
                  <Badge variant="outline" className="text-[9px] uppercase">
                    {userData.role_name}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-primary/10 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <IdCard className="h-3 w-3" />
                  <span>Doc: {userData.identity_document || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="truncate">{userData.email}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: CONCEPTOS */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Package className="h-5 w-5 text-primary" />
              <span>Conceptos a Facturar</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={isSubmitting}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Añadir ítem
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-start bg-slate-50/50 p-4 rounded-xl border group transition-all hover:bg-white hover:shadow-sm"
              >
                <div className="flex-1 grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <Select
                      value={item.item_type}
                      onValueChange={(v) =>
                        updateItem(index, { item_type: v, item_id: "" })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="bg-white border-none shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membership">Membresía</SelectItem>
                        <SelectItem value="package">Paquete</SelectItem>
                        <SelectItem value="product">Producto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-7">
                    {item.item_type === "membership" ? (
                      <Select
                        value={item.item_id}
                        onValueChange={(v) => updateItem(index, { item_id: v })}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-white border-none shadow-sm">
                          <SelectValue
                            placeholder={
                              loadingMems ? "Cargando..." : "Elegir membresía"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {memberships.map((m) => (
                            <SelectItem
                              key={m.membership_type_id}
                              value={m.membership_type_id}
                            >
                              {m.name} — {formatCurrency(m.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : item.item_type === "package" ? (
                      <Select
                        value={item.item_id}
                        onValueChange={(v) => updateItem(index, { item_id: v })}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-white border-none shadow-sm">
                          <SelectValue
                            placeholder={
                              loadingPkgs ? "Cargando..." : "Elegir paquete"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((p) => (
                            <SelectItem key={p.packageId} value={p.packageId}>
                              {p.name} — {formatCurrency(p.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="ID manual..."
                        className="bg-white border-none shadow-sm"
                        value={item.item_id}
                        onChange={(e) =>
                          updateItem(index, { item_id: e.target.value })
                        }
                        disabled={isSubmitting}
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      className="bg-white border-none shadow-sm text-center font-medium"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-destructive hover:bg-destructive/5"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  disabled={items.length === 1 || isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* RESUMEN FINANCIERO */}
          <div className="mt-8 pt-6 border-t border-dashed space-y-4">
            <div className="flex justify-between items-center text-sm px-2">
              <span className="text-muted-foreground font-medium">
                Subtotal Estimado
              </span>
              <span className="font-bold text-slate-700">
                {formatCurrency(totals)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter">
                  Total a Pagar
                </p>
                <p className="text-3xl font-black text-primary tracking-tight">
                  {formatCurrency(totals)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => onSubmit(selectedBranchId, items)}
                  disabled={
                    isSubmitting ||
                    !userData ||
                    !selectedBranchId ||
                    totals === 0
                  }
                  className="px-8 shadow-xl shadow-primary/20 h-12"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Emitiendo..." : "Emitir Factura"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
