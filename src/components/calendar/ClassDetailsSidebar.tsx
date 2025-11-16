"use client";

import { GymClass } from "./types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: GymClass | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClassDetailsSidebar({
  open,
  onOpenChange,
  data,
  onEdit,
  onDelete,
}: Props) {
  if (!data) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-6 space-y-4 w-[350px]">
        <SheetTitle>{data.title}</SheetTitle>

        <p>
          <strong>Instructor:</strong> {data.instructorId}
        </p>
        <p>
          <strong>Inicio:</strong> {String(data.start)}
        </p>
        <p>
          <strong>Fin:</strong> {String(data.end)}
        </p>

        <Button className="w-full" onClick={onEdit}>
          Editar
        </Button>
        <Button className="w-full" variant="destructive" onClick={onDelete}>
          Eliminar
        </Button>
      </SheetContent>
    </Sheet>
  );
}
