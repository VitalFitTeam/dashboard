"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function DeleteClassDialog({ open, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 space-y-4">
        <DialogTitle>Eliminar Clase</DialogTitle>
        <p>¿Seguro que deseas eliminar esta clase?</p>

        <Button variant="destructive" onClick={onConfirm} className="w-full">
          Eliminar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
