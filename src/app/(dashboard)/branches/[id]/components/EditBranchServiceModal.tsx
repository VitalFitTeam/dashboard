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
import React, { useEffect, useState } from "react";

export default function EditBranchServiceModal({
  open,
  onClose,
  service,
  onSave,
  mode = "edit", // 👈 modo agregado
}: {
  open: boolean;
  onClose: () => void;
  service: any;
  onSave: (data: any) => Promise<void>;
  mode?: "view" | "edit"; // 👈 Añadimos el tipo
}) {
  const isViewMode = mode === "view";

  const [maxCapacity, setMaxCapacity] = useState(0);
  const [priceMember, setPriceMember] = useState(0);
  const [priceNonMember, setPriceNonMember] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (service) {
      setMaxCapacity(service.max_capacity);
      setPriceMember(service.price_for_member);
      setPriceNonMember(service.price_for_non_member);
      setIsVisible(service.is_visible);
    }
  }, [service]);

  const handleSave = () => {
    onSave({
      max_capacity: maxCapacity,
      price_for_member: priceMember,
      price_for_non_member: priceNonMember,
      is_visible: isVisible,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Editar servicio</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {!service ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : (
          <div className="space-y-4">
            <p className="text-lg font-semibold">{service.service_name}</p>

            <InputField
              label="Aforo máximo"
              type="number"
              disabled={isViewMode}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
            />

            <InputField
              label="Precio para miembros"
              type="number"
              disabled={isViewMode}
              value={priceMember}
              onChange={(e) => setPriceMember(Number(e.target.value))}
            />

            <InputField
              label="Precio para no miembros"
              type="number"
              disabled={isViewMode}
              value={priceNonMember}
              onChange={(e) => setPriceNonMember(Number(e.target.value))}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={isViewMode}
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
              />
              <label>Visible</label>
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
