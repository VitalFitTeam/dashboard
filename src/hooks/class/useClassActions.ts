"use client";

import { useState, useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { api } from "@/lib/sdk-config";
import { BranchClassInfo, UpdateClassPayload } from "@vitalfit/sdk";

// --- Tipos para asegurar consistencia ---
export interface ClassFormData extends Partial<BranchClassInfo> {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  recurrence?: string;
}

export function useClassActions(token: string | null, classId?: string | null) {
  const { mutate } = useSWRConfig();
  const [isUpdating, setIsUpdating] = useState(false);

  // Clave única para el detalle de la clase
  const CACHE_KEY = classId && token ? [`/schedule/${classId}`, token] : null;

  /**
   * 1. OBTENER DETALLE (GET)
   * Transforma la respuesta del SDK en un formato amigable para formularios
   */
  const { data: selectedClass, isLoading, error } = useSWR(
    CACHE_KEY,
    async () => {
      const response = await api.schedule.GetClassByID(classId!, token!);
      const item = response.data;

      if (!item) {
        return null;
      }

      // Transformación de ISO String a campos de formulario (YYYY-MM-DD y HH:mm)
      return {
        ...item,
        recurrence: "none",
        start_date: item.starts_at.split("T")[0],
        start_time: item.starts_at.split("T")[1].substring(0, 5),
        end_date: item.ends_at.split("T")[0],
        end_time: item.ends_at.split("T")[1].substring(0, 5),
      } as ClassFormData;
    },
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 10000 // Mayor tiempo de caché para detalles
    }
  );

  /**
   * 2. ACTUALIZAR (PUT)
   */
 const updateClass = async (data: ClassFormData, localOffset: string) => {
    if (!token || !classId) {
      return false;
    }

    // 1. Validación preventiva: 
    // Si los campos obligatorios no están, lanzamos un error o aviso antes de llamar a la API
    if (!data.instructor_id || !data.service_id) {
      toast.error("Faltan campos obligatorios: Instructor o Servicio");
      return false;
    }

    setIsUpdating(true);
    try {
      // 2. Construcción del payload asegurando que los tipos coincidan
      const payload: UpdateClassPayload = {
        starts_at: `${data.start_date}T${data.start_time}:00${localOffset}`,
        ends_at: `${data.end_date}T${data.end_time}:00${localOffset}`,
        instructor_id: data.instructor_id, // Aquí TS ya sabe que es string por el check de arriba
        service_id: data.service_id,       // Aquí también
        max_capacity: Number(data.max_capacity) || 0,
        is_visible: !!data.is_visible,     // Forzamos a boolean (true/false)
        notes: data.notes?.trim() || "",
      };

      await api.schedule.UpdateClass(classId, payload, token);
      
      // ... resto del código (mutates y toast)
      return true;
    } catch (err: any) {
      // ... manejo de errores
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 3. ELIMINAR (DELETE)
   */
  const deleteClass = async () => {
    if (!token || !classId) {
      return false;
    };

    setIsUpdating(true);
    try {
      await api.schedule.DeleteClass(classId, token);

      // Limpieza optimista de caché
      mutate(CACHE_KEY, null, false);
      mutate((key: any) => Array.isArray(key) && key.some(k => String(k).includes("schedule")));

      toast.success("Clase eliminada");
      return true;
    } catch (err: any) {
      toast.error("No se pudo eliminar la clase");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    selectedClass,
    isLoading,
    isUpdating,
    error,
    updateClass,
    deleteClass,
  };
}