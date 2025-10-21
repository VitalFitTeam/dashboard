"use client";

import React, { useState, useMemo } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PanelWrapper from "./PanelWrapper";
import EntityItem from "@/components/EntityItem";
import { BranchInstructor } from "@/types/branches";
import { Instructor } from "@/types/instructor";
import { getInitials } from "@/utils";

interface InstructorPanelProps {
  assignedInstructors: BranchInstructor[];
  allInstructors: Instructor[];
  onAdd: (instructorId: string) => void;
  onRemove: (instructorId: string) => void;
  mode: "view" | "edit";
}

export default function InstructorsPanel({
  assignedInstructors,
  allInstructors,
  onAdd,
  onRemove,
  mode,
}: InstructorPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDisabled = mode === "view";

  const availableInstructorsToAssign = useMemo(() => {
    const assignedIds = new Set(
      assignedInstructors.map((inst) => inst.instructorId),
    );
    return allInstructors.filter((inst) => !assignedIds.has(inst.id));
  }, [allInstructors, assignedInstructors]);

  const handleAddClick = () => {
    if (selectedId) {
      onAdd(selectedId);
      setSelectedId(null);
    }
  };

  return (
    <PanelWrapper
      title="Instructores"
      description={
        isDisabled
          ? "Visualizando los instructores asignados a esta sucursal."
          : "Asigna o elimina instructores de esta sucursal."
      }
    >
      {!isDisabled && (
        <div className="mb-8">
          <label
            htmlFor="instructor-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Agregar instructor
          </label>
          <div className="flex items-center gap-4">
            <Select
              value={selectedId ?? ""}
              onValueChange={(value) => setSelectedId(value)}
            >
              <SelectTrigger id="instructor-select" className="flex-grow">
                <SelectValue placeholder="Seleccionar un instructor" />
              </SelectTrigger>
              <SelectContent>
                {availableInstructorsToAssign.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddClick}
              disabled={!selectedId}
            >
              <Plus size={16} className="mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          Instructores de la sucursal
        </h3>

        <div className="space-y-3">
          {assignedInstructors.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay instructores asignados a esta sucursal.
            </p>
          ) : (
            assignedInstructors.map((instructor) => (
              <EntityItem
                key={instructor.instructorId}
                initials={getInitials(instructor.name ?? "??")}
                title={instructor.name ?? "Instructor sin nombre"}
                action={
                  !isDisabled ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(instructor.instructorId);
                      }}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-red-600"
                      aria-label="Eliminar instructor"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    </PanelWrapper>
  );
}
