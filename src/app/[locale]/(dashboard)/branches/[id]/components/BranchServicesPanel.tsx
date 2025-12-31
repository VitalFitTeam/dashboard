"use client";

import React, { useEffect, useState, forwardRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus, Trash2, LayoutList, RotateCcw } from "lucide-react";
import { getInitials } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputField from "@/components/ui/InputField";
import { useAuth } from "@/context/AuthContext";
import {
  BranchServicePrice,
  CreateBranchServicePriceItem,
  ServiceFullDetail,
} from "@vitalfit/sdk";
import { api } from "@/lib/sdk-config";
import EditBranchServiceModal from "./EditBranchServiceModal";
import { toast } from "sonner";
import { branchServiceSchema } from "@/lib/validation/branchServiceSchema";
import EntityItem from "@/components/layout/EntityItem";
import { PaginationControls } from "@/components/ui/table/PaginationControls";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { ServiceGlobalSelector } from "@/components/modules/branches/ServiceGlobalSelector";

interface BranchServicePanelProps {
  branchId: string;
  mode: "view" | "edit";
}

const BranchServicePanel = forwardRef<HTMLDivElement, BranchServicePanelProps>((props, ref) => {
  const { branchId, mode = "edit" } = props;
  const t = useTranslations("branches");
  const { token } = useAuth();
  const isDisabled = mode === "view";
  const [services, setServices] = useState<BranchServicePrice[]>([]);
  const [newServices, setNewServices] = useState<CreateBranchServicePriceItem[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]); 
  const [selectedService, setSelectedService] = useState<ServiceFullDetail | null>(null);
  
  const [aforo, setAforo] = useState<number>(0);
  const [priceMember, setPriceMember] = useState<number>(0);
  const [priceNonMember, setPriceNonMember] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<BranchServicePrice | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const fetchBranchServices = useCallback(async () => {
    if (!token || !branchId) {
      return;
    setIsLoading(true);
    }
    try {
      const response = await api.products.getBranchServices(branchId, token);
      setServices(response.data || []);
      setNewServices([]);
      setRemovedIds([]);
    } catch (err) {
      toast.error(t("details.services.error_load_branch"));
    } finally {
      setIsLoading(false);
    }
  }, [token, branchId, t]);

  useEffect(() => {
    fetchBranchServices();
  }, [fetchBranchServices]);

  const handleAddLocal = () => {
    if (!selectedService) {
      return;
    }

    const newItem: CreateBranchServicePriceItem = {
      service_id: selectedService.service_id,
      max_capacity: aforo,
      price_for_member: priceMember,
      price_for_non_member: priceNonMember,
      is_visible: isVisible,
    };

    const result = branchServiceSchema.safeParse(newItem);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    if (removedIds.includes(selectedService.service_id)) {
        setRemovedIds(prev => prev.filter(id => id !== selectedService.service_id));
    }

    setServices((prev) => [...prev, { ...newItem, service_name: selectedService.name } as BranchServicePrice]);
    setNewServices((prev) => [...prev, newItem]);
    
    setSelectedService(null);
    setAforo(0); setPriceMember(0); setPriceNonMember(0);
    toast.info("Servicio añadido a la cola local");
  };

  const handleSaveSync = async () => {
    if (!token || !branchId) {
      return;
    }
    if (newServices.length === 0 && removedIds.length === 0) {
      toast.error("No hay cambios pendientes");
      return;
    }

    setIsSaving(true);
    try {
      if (newServices.length > 0) {
        await api.products.addBranchService(newServices, branchId, token);
      }
      for (const id of removedIds) {
        await api.products.removeBranchService(branchId, id, token);
      }

      toast.success(t("details.services.save_success"));
      await fetchBranchServices(); 
    } catch (error) {
      console.error(error);
      toast.error(t("details.services.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLocal = (serviceId: string) => {
    const isNew = newServices.some(s => s.service_id === serviceId);
    
    if (isNew) {
      setNewServices(prev => prev.filter(s => s.service_id !== serviceId));
    } else {
      setRemovedIds(prev => [...prev, serviceId]);
    }

    setServices(prev => prev.filter(s => s.service_id !== serviceId));
    
    toast.warning("Servicio quitado (pendiente de sincronizar)");
  };

  const handleDiscard = () => {
    fetchBranchServices();
    toast.info("Cambios locales descartados");
  };

  const handleUpdateService = async (updatedData: any) => {
    if (!serviceToEdit || !token || !branchId) {
      return;
    }
    try {
      await api.products.updateBranchService(branchId, serviceToEdit.service_id, updatedData, token);
      setServices((prev) => prev.map((s) => s.service_id === serviceToEdit.service_id ? { ...s, ...updatedData } : s));
      setEditModalOpen(false);
      toast.success(t("details.services.success_update", { name: serviceToEdit.service_name }));
    } catch (err) {
      toast.error(t("details.services.error_update"));
    }
  };

  const handleViewService = (service: BranchServicePrice) => {
    setServiceToEdit(service);
    setModalMode("view");
    setEditModalOpen(true);
  };

  const handleEditService = (service: BranchServicePrice) => {
    setServiceToEdit(service);
    setModalMode("edit");
    setEditModalOpen(true);
  };

  const hasChanges = newServices.length > 0 || removedIds.length > 0;

  const activeServiceIds = useMemo(() => services.map(s => s.service_id), [services]);

  const totalPages = Math.ceil(services.length / pageSize) || 1;
  const currentServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return services.slice(start, start + pageSize);
  }, [services, currentPage, pageSize]);

  return (
    <div ref={ref} className="space-y-10 animate-in fade-in duration-500">
      <section>
        <h2 className="text-xl text-orange-400 font-semibold tracking-tight uppercase ">
          {t("details.services.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          {t("details.services.subtitle")}
        </p>
      </section>

      {!isDisabled && token && (
        <div className="p-6 border rounded-2xl bg-slate-50/50 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  {t("details.services.add.title")}
                </label>
                <ServiceGlobalSelector
                  token={token}
                  onSelect={setSelectedService}
                  excludeIds={activeServiceIds} 
                  placeholder={t("details.services.add.select_placeholder")}
                />
              </div>

              <InputField label={t("details.services.add.capacity")} type="number" value={aforo} onChange={(e) => setAforo(Number(e.target.value))} className="bg-white" />
              <InputField label={t("details.services.add.member_price")} type="number" value={priceMember} onChange={(e) => setPriceMember(Number(e.target.value))} className="bg-white" />
              <InputField label={t("details.services.add.non_member_price")} type="number" value={priceNonMember} onChange={(e) => setPriceNonMember(Number(e.target.value))} className="bg-white" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" disabled={!selectedService || aforo <= 0} onClick={handleAddLocal} className="font-bold text-xs uppercase tracking-widest bg-white">
                  <Plus size={16} className="mr-2" /> {t("details.services.add.button")}
                </Button>
                <Button onClick={handleSaveSync} disabled={!hasChanges || isSaving} className="font-bold text-xs uppercase tracking-widest bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100">
                  {isSaving ? t("create.form.buttons.saving") : "Sincronizar Cambios"}
                </Button>
                {hasChanges && (
                  <Button variant="ghost" onClick={handleDiscard} className="text-slate-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-tighter">
                    <RotateCcw size={14} className="mr-1" /> Descartar
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="visible-check" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-4 w-4 rounded accent-orange-500 cursor-pointer" />
                <label htmlFor="visible-check" className="text-[11px] font-black uppercase tracking-tighter text-slate-500 cursor-pointer">{t("details.services.add.visible")}</label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <h3 className="font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-3">
            {t("details.services.assigned_title")} {services.length}

            {hasChanges && (
               <Badge className="bg-orange-50 text-orange-600 border-orange-100 animate-pulse font-black text-[10px]">
                  CAMBIOS PENDIENTES
                </Badge>
            )}
          </h3>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          {isLoading && services.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase animate-pulse tracking-widest italic">
              {t("details.services.loading")}
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center text-slate-300">
              <LayoutList className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-[10px] uppercase font-black tracking-[0.2em]">{t("details.services.empty")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentServices.map((service) => (
                <div key={service.service_id} className="group flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <EntityItem
                    initials={getInitials(service.service_name ?? "??")}
                    title={service.service_name ?? `${t("catalog.services.id_prefix")}: ${service.service_id}`}
                    description={t("details.services.description", {
                      capacity: service.max_capacity,
                      memberPrice: service.price_for_member,
                      nonMemberPrice: service.price_for_non_member,
                      visible: service.is_visible ? t("details.services.yes") : t("details.services.no"),
                    })}
                  />
                  {!isDisabled && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      <Button variant="ghost" size="icon" onClick={() => handleViewService(service)} className="h-9 w-9 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                        <Eye size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditService(service)} className="h-9 w-9 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                        <Pencil size={17} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveLocal(service.service_id)} className="h-9 w-9 text-slate-400 hover:text-destructive hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {services.length > 0 && (
          <div className="flex items-center justify-between pt-4 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t("pagination.show")}</span>
              <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-16 text-[11px] font-bold border-slate-200 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map(size => <SelectItem key={size} value={size.toString()} className="text-xs">{size}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <EditBranchServiceModal
        open={editModalOpen && !!serviceToEdit}
        onClose={() => { setEditModalOpen(false); setServiceToEdit(null); }}
        service={serviceToEdit!}
        onSave={handleUpdateService}
        mode={modalMode}
      />
    </div>
  );
});

BranchServicePanel.displayName = "BranchServicePanel";
export default BranchServicePanel;