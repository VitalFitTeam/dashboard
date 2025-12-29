"use client";

import React, { useState, useMemo } from "react";
<<<<<<< HEAD
import { Plus, UserPlus, AlertCircle, Save, X, Users, CheckCircle2 } from "lucide-react";
=======
import { Plus, UserPlus } from "lucide-react";
>>>>>>> development
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
<<<<<<< HEAD
import InputField from "@/components/ui/InputField";
=======
>>>>>>> development
import useBranchStaff from "@/hooks/branches/useStaffBranch";
import { useStaffUsers } from "@/hooks/staff/useStaffUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BranchStaffTable from "@/components/modules/BranchStaff/BranchStaffTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";

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
    if (!catalogUsers) {
      return [];
    }
    const ALLOWED_ROLES = ["recepcionist", "accountant", "data_analyst"];
    
    const existingIds = new Set([
      ...(branchStaff?.map((s) => s.user_id) || []),
      ...(pendingStaff.map((s) => s.user_id)),
    ]);

    return catalogUsers.filter((user: any) => {
      if (existingIds.has(user.user_id)){
         return false;
      }
      const role = getUserRole(user);
      
      const isForbidden = ["super_admin", "branch_admin", "instructor"].includes(role);
      if (isForbidden || !ALLOWED_ROLES.includes(role)) {
        return false;
      }
      
      return roleFilter === "all" || role === roleFilter;
    });
  }, [catalogUsers, roleFilter, branchStaff, pendingStaff]);

  const tableData = useMemo(() => {
    const current = (branchStaff || [])
      .filter((s) => !removedStaffIds.includes(s.user_id))
      .map((s) => ({ ...s, isPending: false }));

    // 2. Personal en cola (pendientes)
    const pending = pendingStaff.map((u) => ({ 
      ...u, 
      isPending: true 
    }));

    return [...current, ...pending] as (Staff & { isPending?: boolean })[];
  }, [branchStaff, pendingStaff, removedStaffIds]);

  const handleAddToLocal = () => {
    if (!selectedUser?.user_id){
       return;
    }
    
    setPendingStaff(prev => [...prev, selectedUser as User]);
    setSelectedUser(null);
    setSearchTerm("");
    toast.success("Empleado añadido a la cola");
  };

  const handleRemoveLocal = (id: string, isPending?: boolean) => {
    if (isPending) {
      setPendingStaff(prev => prev.filter(u => u.user_id !== id));
    } else {
      setRemovedStaffIds(prev => [...prev, id]);
    }
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
      toast.success("Cambios sincronizados correctamente");
    } catch {
      toast.error("Error al sincronizar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = pendingStaff.length > 0 || removedStaffIds.length > 0;

  return (
  <div className="space-y-8 animate-in fade-in duration-700  mx-auto p-4">
    {!isDisabled && (
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <UserPlus size={18} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                  Vincular Personal
                </CardTitle>
                <p className="text-xs text-slate-500 font-medium italic">
                  Busca y añade empleados a esta sucursal
                </p>
              </div>
            </div>
            
            {hasChanges && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse font-bold text-[10px]">
                TIENES CAMBIOS PENDIENTES
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* GRILLA DE FILTROS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                1. Búsqueda Directa
              </label>
              <Input
                placeholder="Nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 bg-white border-slate-200 focus-visible:ring-slate-400"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                2. Especialidad / Rol
              </label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10">
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

          {/* SELECTOR DE EMPLEADO */}
          <div className="space-y-2 text-left pt-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
              3. Resultados del Catálogo
            </label>
            <Select
              value={selectedUser?.user_id ?? ""}
              onValueChange={(id) => {
                const user = filteredCatalogUsers.find(u => u.user_id === id);
                setSelectedUser(user || null);
              }}
            >
              <SelectTrigger className="h-11 border-slate-200 bg-white font-medium text-slate-700">
                <SelectValue placeholder={isCatalogLoading ? "Sincronizando perfiles..." : "Elige un perfil de la lista"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredCatalogUsers.map((user: User) => (
                  <SelectItem key={user.user_id} value={user.user_id} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold leading-none">{user.first_name} {user.last_name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-1">{getUserRole(user)}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ACCIONES PRINCIPALES */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleAddToLocal} 
                disabled={!selectedUser} 
                variant="secondary"
                className="h-10 px-6 font-bold text-xs uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-900 border-none transition-all active:scale-95"
              >
                <Plus size={16} className="mr-2" /> Agregar
              </Button>
              <Button 
                onClick={handleSaveChanges} 
                disabled={!hasChanges || isSaving}
                className="h-10 px-8 font-bold text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all active:scale-95"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>

            {hasChanges && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setPendingStaff([]); setRemovedStaffIds([]); }}
                className="text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-tighter"
              >
                Descartar cambios
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )}

    {/* SECCIÓN DE LA TABLA */}
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-slate-900 rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            Personal en Sede
            <Badge variant="outline" className="ml-1 font-black bg-white border-slate-200 text-slate-900 px-2 py-0">
              {tableData.length}
            </Badge>
          </h3>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <BranchStaffTable
          data={tableData}
          isLoading={isBranchLoading}
          onRemove={handleRemoveLocal}
        />
      </div>
    </div>

    <Separator className="opacity-50" />
  </div>
);
}