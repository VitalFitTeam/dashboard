"use client";

import React, { useState, useMemo } from "react";
import { Plus, RotateCcw, Save, Users } from "lucide-react";
import { GetUserResponse, User, Staff } from "@vitalfit/sdk";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import useBranchStaff from "@/hooks/branches/useStaffBranch";
import { useStaffUsers } from "@/hooks/staff/useStaffUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BranchStaffTable from "@/components/modules/BranchStaff/BranchStaffTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import { SectionHeader } from "@/components/modules/branches/SectionHeader";

interface BranchStaffPanelProps {
  branchId: string;
  mode?: "view" | "edit";
}

const getUserRole = (user: any) =>
  String(user.role || user.role_name || "").toLowerCase().trim();

export default function BranchStaffManager({
  branchId,
  mode = "edit",
}: BranchStaffPanelProps) {
  const { token } = useAuth();
  const isDisabled = mode === "view";

  const {
    branchStaff,
    assignStaff,
    removeStaff,
    isLoading: isBranchLoading,
  } = useBranchStaff(token, branchId);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | GetUserResponse | null>(null);
  const [pendingStaff, setPendingStaff] = useState<User[]>([]);
  const [removedStaffIds, setRemovedStaffIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { users: catalogUsers, isLoading: isCatalogLoading } = useStaffUsers(
    token,
    searchTerm ? { search: searchTerm } : {}
  );

  const filteredCatalogUsers = useMemo(() => {
    if (!catalogUsers) return [];
    const ALLOWED_ROLES = ["recepcionist", "accountant", "data_analyst"];
    
    const existingIds = new Set([
      ...(branchStaff?.map((s) => s.user_id) || []),
      ...(pendingStaff.map((s) => s.user_id)),
    ]);

    return catalogUsers.filter((user: any) => {
      if (existingIds.has(user.user_id)) return false;
      const role = getUserRole(user);
      const isForbidden = ["super_admin", "branch_admin", "instructor"].includes(role);
      if (isForbidden || !ALLOWED_ROLES.includes(role)) return false;
      return roleFilter === "all" || role === roleFilter;
    });
  }, [catalogUsers, roleFilter, branchStaff, pendingStaff]);

  const tableData = useMemo(() => {
    const current = (branchStaff || [])
      .filter((s) => !removedStaffIds.includes(s.user_id))
      .map((s) => ({ ...s, isPending: false }));

    const pending = pendingStaff.map((u) => ({ 
      ...u, 
      isPending: true 
    }));

    return [...current, ...pending] as (Staff & { isPending?: boolean })[];
  }, [branchStaff, pendingStaff, removedStaffIds]);

  const handleAddToLocal = () => {
    if (!selectedUser?.user_id) {
      return;
    }

    if (removedStaffIds.includes(selectedUser.user_id)) {
      setRemovedStaffIds(prev => prev.filter(id => id !== selectedUser.user_id));
    } else {
      setPendingStaff(prev => [...prev, selectedUser as User]);
    }

    setSelectedUser(null);
    setSearchTerm("");
    toast.success("Empleado añadido a la cola local");
  };

  const handleRemoveLocal = (id: string, isPending?: boolean) => {
    if (isPending) {
      setPendingStaff(prev => prev.filter(u => u.user_id !== id));
    } else {
      setRemovedStaffIds(prev => [...prev, id]);
    }
    toast.warning("Cambio pendiente de sincronizar");
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const pendingIds = pendingStaff.map(u => u.user_id);
      if (pendingIds.length > 0) {
        await assignStaff({ staff_ids: pendingIds });
      }
      for (const id of removedStaffIds) {
        await removeStaff(id);
      }

      setPendingStaff([]);
      setRemovedStaffIds([]);
      toast.success("Sincronización exitosa");
    } catch {
      toast.error("Error al sincronizar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setPendingStaff([]);
    setRemovedStaffIds([]);
    toast.info("Cambios locales descartados");
  };

  const hasChanges = pendingStaff.length > 0 || removedStaffIds.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Gestión de Staff"
        subtitle="Administra el personal administrativo y contable de la sede."
        icon={Users}
        isViewMode={isDisabled}
      />

      {!isDisabled && (
        <Card className="border shadow-none bg-slate-50/40">
          <CardHeader className="pb-4 text-left">
            <CardTitle className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Vincular Nuevo Personal
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Búsqueda Directa</label>
                <Input
                  placeholder="Nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Filtrar por Rol</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier especialidad</SelectItem>
                    <SelectItem value="accountant">Contador</SelectItem>
                    <SelectItem value="recepcionist">Recepcionista</SelectItem>
                    <SelectItem value="data_analyst">Analista de Datos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Perfil Seleccionado</label>
              <Select
                value={selectedUser?.user_id ?? ""}
                onValueChange={(id) => {
                  const user = filteredCatalogUsers.find(u => u.user_id === id);
                  setSelectedUser(user || null);
                }}
              >
                <SelectTrigger className="bg-white h-11 font-medium">
                  <SelectValue placeholder={isCatalogLoading ? "Sincronizando perfiles..." : "Elige un perfil de la lista"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredCatalogUsers.map((user: User) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold border">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-semibold leading-none">{user.first_name} {user.last_name}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-1">{getUserRole(user)}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddToLocal} 
                  disabled={!selectedUser} 
                  variant="outline"
                  size="sm"
                  className="bg-white font-bold text-xs uppercase tracking-widest border-slate-200"
                >
                  <Plus size={16} className="mr-2" /> Agregar a cola
                </Button>
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={!hasChanges || isSaving}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? "Guardando..." : "Sincronizar Cambios"}
                </Button>
              </div>

              {hasChanges && (
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDiscard}
                    className="text-slate-400 hover:text-orange-500 font-bold text-[10px] uppercase tracking-tighter"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Descartar
                  </Button>
                  <Badge variant="outline" className="animate-pulse border-orange-200 text-orange-600 font-bold text-[10px]">
                    CAMBIOS PENDIENTES
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
         <h3 className="font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-3">
            Personal en Sede {tableData.length}
          </h3>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
          <BranchStaffTable
            data={tableData}
            isLoading={isBranchLoading}
            onRemove={handleRemoveLocal}
          />
        </div>
      </div>
    </div>
  );
}