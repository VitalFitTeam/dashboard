"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { BranchInstructorInfo, InstructorDataList } from "@vitalfit/sdk";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EntityItem from "@/components/features/EntityItem";
import { toast } from "sonner";

interface BranchInstructorPanelProps {
  branchId: string;
}

export default function BranchInstructorPanel({
  branchId,
}: BranchInstructorPanelProps) {
  const { token } = useAuth();

  const [branchInstructors, setBranchInstructors] = useState<
    BranchInstructorInfo[]
  >([]);
  const [allInstructors, setAllInstructors] = useState<InstructorDataList[]>(
    [],
  );
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchBranchInstructors = useCallback(async () => {
    if (!token || !branchId) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.instructor.getBranchInstructors(
        branchId,
        {},
        token,
      );
      const mapped = (res.data || []).map((i: any) => ({
        instructorID: i.instructor_id,
        instructorName: i.instructor_name,
        email: i.email,
        phone: i.phone,
      }));
      setBranchInstructors(mapped);
    } catch (err) {
      console.error("Error cargando instructores de la sucursal:", err);
      toast.error("No se pudieron cargar los instructores de la sucursal");
    } finally {
      setLoading(false);
    }
  }, [token, branchId]);

  const fetchAllInstructors = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.instructor.getInstructors(
        {
          page: 1,
        },
        token,
      );
      console.log("instructores", res.data);
      setAllInstructors(res.data);
    } catch (err) {
      // ...
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleAddInstructor = () => {
    if (!selectedInstructorId) {
      return;
    }

    if (
      branchInstructors.some((i) => i.instructorID === selectedInstructorId)
    ) {
      toast.error("El instructor ya está asignado a esta sucursal");
      return;
    }

    // Agregar temporalmente a la lista y marcar dirty
    const instructor = allInstructors.find(
      (i) => i.instructor_id === selectedInstructorId,
    );
    if (!instructor) {
      return;
    }

    setBranchInstructors((prev) => [
      ...prev,
      {
        instructorID: instructor.instructor_id,
        instructorName: `${instructor.first_name} ${instructor.last_name}`,
        email: instructor.email ?? "",
        phone: instructor.phone ?? "",
      },
    ]);
    setDirty(true);
    toast.success(
      "Instructor seleccionado para agregar. Guarda los cambios para aplicar.",
    );
    setSelectedInstructorId(null);
  };

  const handleRemoveInstructor = async (instructorId: string) => {
    if (!token || !branchId) {
      return;
    }

    setLoading(true);
    try {
      await api.instructor.removeBranchInstructor(
        branchId,
        instructorId,
        token,
      );
      setBranchInstructors((prev) =>
        prev.filter((i) => i.instructorID !== instructorId),
      );
      setDirty(false);
      toast.success("Instructor eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando instructor:", err);
      toast.error("No se pudo eliminar el instructor");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !branchId) {
      return;
    }
    setLoading(true);
    try {
      if (selectedInstructorId) {
        await api.instructor.addBranchInstructor(
          branchId,
          [selectedInstructorId],
          token,
        );
        setSelectedInstructorId(null);
      }
      await fetchBranchInstructors();
      setDirty(false);
      toast.success("Cambios guardados correctamente");
    } catch (err) {
      console.error("Error guardando cambios:", err);
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchInstructors();
    fetchAllInstructors();
  }, [fetchBranchInstructors, fetchAllInstructors]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-grow">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Agregar instructor
          </label>

          <Select
            value={selectedInstructorId ?? ""}
            onValueChange={setSelectedInstructorId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un instructor" />
            </SelectTrigger>
            <SelectContent>
              {allInstructors.map((instr) => (
                <SelectItem
                  key={instr.instructor_id}
                  value={instr.instructor_id}
                >
                  {`${instr.first_name} ${instr.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={handleAddInstructor}
          disabled={!selectedInstructorId || loading}
        >
          Agregar
        </Button>
        <Button type="button" onClick={handleSave} disabled={!dirty || loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {/* Lista de instructores asignados */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500">Cargando instructores...</p>
        ) : branchInstructors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay instructores asignados a esta sucursal.
          </p>
        ) : (
          branchInstructors.map((instr) => (
            <EntityItem
              key={instr.instructorID}
              initials={
                instr.instructorName
                  ?.split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("") ?? "?"
              }
              title={instr.instructorName ?? "Sin nombre"}
              description={instr.email}
              action={
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => handleRemoveInstructor(instr.instructorID)}
                >
                  Eliminar
                </button>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
