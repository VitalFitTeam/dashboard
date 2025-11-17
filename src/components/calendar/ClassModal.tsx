"use client";

import { useEffect, useState } from "react";
import { GymClass } from "./types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/Input"; // Asumiendo que Input es un componente sencillo de texto/número

// Objeto base para una nueva clase. Debe incluir TODOS los campos requeridos por GymClass.
const EMPTY_CLASS: GymClass = {
  id: "", // Se asigna en CalendarWrapper.handleSave
  title: "Nueva Clase",
  instructorId: "",
  // Usar la fecha actual para que sea visible inmediatamente en el calendario
  start: new Date().toISOString().slice(0, 16),
  end: new Date().toISOString().slice(0, 16),
  // Valores por defecto basados en tu MER y el sistema de colores
  type: "Yoga",
  branchId: "b-default-id",
  maxCapacity: 20,
};

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  data: GymClass | null;
  onSave: (data: GymClass) => void;
}

export function ClassModal({ open, onOpenChange, data, onSave }: Props) {
  // 1. Inicializa el formulario con 'data' (edición) o con EMPTY_CLASS (creación)
  const [form, setForm] = useState<GymClass>(data || EMPTY_CLASS);

  // 2. Sincroniza el estado 'form' cuando el modal se abre o cuando 'data' cambia
  useEffect(() => {
    if (open) {
      // Asegura que el formulario se carga con data si existe, o EMPTY_CLASS si es nuevo
      setForm(data || EMPTY_CLASS);
    }
  }, [open, data]);

  // Función genérica para actualizar cualquier campo del formulario
  const update = (key: keyof GymClass, value: any) =>
    setForm({ ...form, [key]: value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 space-y-4">
        <DialogTitle>{data?.id ? "Editar Clase" : "Crear Clase"}</DialogTitle>

        {/* Título de la Clase */}
        <Input
          placeholder="Nombre de la clase"
          value={form.title || ""}
          onChange={(e) => update("title", e.target.value)}
        />

        {/* Tipo de Clase (Para el color) */}
        <select
          value={form.type || ""}
          onChange={(e) => update("type", e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="" disabled>
            Seleccionar Tipo
          </option>
          {/* Reemplaza esto con los valores reales de tu tabla services */}
          <option value="Yoga">Yoga</option>
          <option value="Spinning">Spinning</option>
          <option value="Zumba">Zumba</option>
          <option value="Weightlifting">Levantamiento</option>
        </select>

        {/* Instructor ID */}
        <Input
          placeholder="ID del Instructor"
          value={form.instructorId || ""}
          onChange={(e) => update("instructorId", e.target.value)}
        />

        {/* Fecha y Hora de Inicio */}
        <label className="text-xs font-medium">Inicio</label>
        <Input
          type="datetime-local"
          value={(form.start || "").toString().slice(0, 16)}
          onChange={(e) => update("start", e.target.value)}
        />

        {/* Fecha y Hora de Fin */}
        <label className="text-xs font-medium">Fin</label>
        <Input
          type="datetime-local"
          value={(form.end || "").toString().slice(0, 16)}
          onChange={(e) => update("end", e.target.value)}
        />

        {/* Capacidad Máxima */}
        <Input
          placeholder="Capacidad Máxima"
          type="number"
          value={form.maxCapacity || 0}
          // Convierte el valor a número (int)
          onChange={(e) => update("maxCapacity", parseInt(e.target.value) || 0)}
        />

        <Button className="w-full" onClick={() => onSave(form)}>
          Guardar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
