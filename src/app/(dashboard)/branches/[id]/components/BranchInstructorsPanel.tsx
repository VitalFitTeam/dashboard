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

import { BranchInstructor } from "@/models/branches";
import { Instructor } from "@/models/instructor";
import { getInitials } from "@/utils";
import EntityItem from "@/components/features/EntityItem";

interface InstructorPanelProps {
  assignedInstructors: BranchInstructor[];
  allInstructors: Instructor[];
  onAdd: (instructorId: string) => void;
  onRemove: (instructorId: string) => void;
  mode: "view" | "edit";
}

export default function BranchInstructorPanel({
  assignedInstructors = [],
  allInstructors = [],
  onAdd = () => {},
  onRemove = () => {},
  mode = "edit",
}: InstructorPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDisabled = mode === "view";

  const availableInstructors = useMemo(() => {
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
    <div className="space-y-8">
      {!isDisabled && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Agregar instructor
          </h3>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow space-y-1.5">
              <label
                htmlFor="instructor-select"
                className="text-sm font-medium text-gray-700"
              >
                Instructor
              </label>
              <Select
                value={selectedId ?? ""}
                onValueChange={(value) => setSelectedId(value)}
              >
                <SelectTrigger id="instructor-select">
                  <SelectValue placeholder="Seleccionar un instructor" />
                </SelectTrigger>
                <SelectContent>
                  {availableInstructors.length > 0 ? (
                    availableInstructors.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No hay instructores disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddClick}
              disabled={!selectedId}
              className="w-full sm:w-auto flex-shrink-0"
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
        {assignedInstructors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay instructores asignados a esta sucursal.
          </p>
        ) : (
          <div className="space-y-3">
            {assignedInstructors.map((inst) => (
              <EntityItem
                key={inst.instructorId}
                initials={getInitials(inst.name ?? "??")}
                title={inst.name ?? "Instructor sin nombre"}
                description={`ID: ${inst.instructorId}`}
                action={
                  !isDisabled ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(inst.instructorId);
                      }}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-red-600"
                      aria-label="Eliminar instructor"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
