"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Trash2, X, Pencil, MoreHorizontal } from "lucide-react";
import ScheduleClassForm, { ScheduleClassFormData } from "./ScheduleClassForm";
import { useClassActions } from "@/hooks/class/useClassActions";
import { useCalendarResources } from "@/hooks/class/useCalendarResources";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";

interface EditClassPopoverProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditClassPopover({
  classId,
  isOpen,
  onClose,
  onSuccess,
}: EditClassPopoverProps) {
  const t = useTranslations("calendar.edit_popover");
  const { token } = useAuth();
  const hasHydrated = useRef(false);
  const initialFormRef = useRef<ScheduleClassFormData | null>(null);

  const { selectedClass, isLoading, isUpdating, updateClass, deleteClass } =
    useClassActions(token, classId);

  const [localFormData, setLocalFormData] =
    useState<ScheduleClassFormData | null>(null);

  const { branches, services, instructors, isLoadingResources } =
    useCalendarResources(token, selectedClass?.branch_id || null);


  useEffect(() => {
    if (!isOpen) {
      hasHydrated.current = false;
      initialFormRef.current = null;
      setLocalFormData(null);
    }
  }, [isOpen]);


 useEffect(() => {
  if (
    selectedClass?.starts_at &&
    selectedClass?.ends_at &&
    !hasHydrated.current
  ) {
    const start = parseISO(selectedClass.starts_at);
    const end = parseISO(selectedClass.ends_at);

    // Creamos el objeto asegurando que los campos obligatorios tengan un fallback
    const hydratedData: ScheduleClassFormData = {
      // Campos obligatorios: si no vienen en selectedClass, usamos un string vacío
      branch_id: selectedClass.branch_id || "",
      service_id: selectedClass.service_id || "",
      instructor_id: selectedClass.instructor_id || "",
      max_capacity: selectedClass.max_capacity ?? 10,
      is_visible: !!selectedClass.is_visible,
      recurrence: (selectedClass.recurrence as any) || "none",
      
      // Campos calculados para el formulario
      start_date: format(start, "yyyy-MM-dd"),
      start_time: format(start, "HH:mm"),
      end_time: format(end, "HH:mm"),
      end_date: format(start, "yyyy-MM-dd"), // Añadido si tu interfaz lo pide
      
      // Campos opcionales
      notes: selectedClass.notes || "",
    };

    setLocalFormData(hydratedData);
    initialFormRef.current = hydratedData;
    hasHydrated.current = true;
  }
}, [selectedClass]);

  const handleChange = (field: keyof ScheduleClassFormData, value: any) => {
    setLocalFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const hasChanges = useMemo(() => {
    if (!localFormData || !initialFormRef.current){
       return false;
    }
    return (
      JSON.stringify(localFormData) !== JSON.stringify(initialFormRef.current)
    );
  }, [localFormData]);

  const handleUpdate = async () => {
    if (!localFormData || !hasChanges) {
      return;
    }
    try {
      const timezoneOffset = format(new Date(), "xxx");
      const payload = {
        ...localFormData,
        starts_at: `${localFormData.start_date}T${localFormData.start_time}:00${timezoneOffset}`,
        ends_at: `${localFormData.start_date}T${localFormData.end_time}:00${timezoneOffset}`,
      };

      const success = await updateClass(payload as any, timezoneOffset);
      if (success) {
        toast.success(t("success_update"));
        onSuccess();
        onClose();
      }
    } catch {
      toast.error(t("error_save"));
    }
  };

  const handleDelete = async () => {
    const success = await deleteClass();
    if (success) {
      onSuccess();
      onClose();
    }
  };

  const isGlobalLoading = isLoading || isLoadingResources;

  return (
    <Popover open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <PopoverAnchor className="fixed top-1/2 left-1/2" />

      <PopoverContent
        align="center"
        side="top"
        sideOffset={-240}
        className="w-[440px] p-0 rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-visible z-[50] animate-in zoom-in-95 duration-200"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >

        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-orange-600" />
            <p className="text-sm font-bold text-slate-900 leading-none">{t("title")}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-md text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>


        <div className="max-h-[60vh] overflow-y-auto p-5 bg-slate-50/30 custom-scrollbar">
          {isGlobalLoading ? (
            <div className="py-16 flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("loading")}
              </p>
            </div>
          ) : (
            localFormData && (
              <ScheduleClassForm
                formData={localFormData}
                errors={{}}
                onChange={handleChange}
                branches={branches}
                services={services}
                instructors={instructors}
                disabled={isUpdating}
                isCreateMode={false}
              />
            )
          )}
        </div>


        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
          <GeneralAlertDialog
            title={t("delete_confirm.title")}
            description={t("delete_confirm.description")}
            actionText={t("delete_confirm.action")}
            cancelText={t("cancel")}
            actionVariant="destructive"
            onAction={handleDelete}
            trigger={
              <Button
                variant="ghost"
                className="text-red-500 hover:bg-red-50 text-xs font-bold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("delete_button")}
              </Button>
            }
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating || !hasChanges}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black h-9 px-6 rounded-xl shadow-sm transition-all active:scale-95"
            >
              {isUpdating ? t("saving") : t("save_changes")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}