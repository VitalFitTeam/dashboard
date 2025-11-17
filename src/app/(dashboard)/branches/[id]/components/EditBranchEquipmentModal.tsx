"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import InputField from "@/components/ui/InputField";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { BranchEquipmentInventory, EquipmentStatus } from "@vitalfit/sdk";

interface EditBranchEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  equipment: BranchEquipmentInventory | null;
  onSave: (data: {
    last_maintenance_date: string;
    notes: string;
    status: EquipmentStatus;
  }) => Promise<void>;
  mode?: "view" | "edit";
}

export default function EditBranchEquipmentModal({
  open,
  onClose,
  equipment,
  onSave,
  mode = "edit",
}: EditBranchEquipmentModalProps) {
  const isViewMode = mode === "view";

  const [lastMaintenanceDate, setLastMaintenanceDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<EquipmentStatus>("Available");

  useEffect(() => {
    if (equipment) {
      // Convertimos a formato yyyy-MM-dd para el input type="date"
      setLastMaintenanceDate(
        equipment.last_maintenance_date?.split("T")[0] || "",
      );
      setNotes(equipment.notes || "");
      setStatus(equipment.status || "Available");
    }
  }, [equipment]);

  const handleSave = () => {
    onSave({
      last_maintenance_date: lastMaintenanceDate,
      notes,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Editar equipamiento</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {!equipment ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : (
          <div className="space-y-4">
            <p className="text-lg font-semibold">{equipment.serial_number}</p>

            <InputField
              label="Último mantenimiento"
              type="date"
              disabled={isViewMode}
              value={lastMaintenanceDate}
              onChange={(e) => setLastMaintenanceDate(e.target.value)}
            />

            <InputField
              label="Notas"
              type="text"
              disabled={isViewMode}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as EquipmentStatus)}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="InMaintenance">InMaintenance</SelectItem>
                  <SelectItem value="OutOfService">OutOfService</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!isViewMode && (
          <DialogFooter>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
