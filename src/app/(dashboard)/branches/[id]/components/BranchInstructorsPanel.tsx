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
      const res = await api.instructor.getInstructors({}, token);
      setAllInstructors(res.data);
    } catch (err) {
      console.error("Error cargando instructores:", err);
      toast.error("No se pudieron cargar los instructores disponibles");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleAddInstructor = async () => {
    if (!token || !branchId || !selectedInstructorId) {
      return;
    }

    try {
      setLoading(true);
      await api.instructor.addBranchInstructor(
        branchId,
        [selectedInstructorId],
        token,
      );
      toast.success("Instructor agregado correctamente");
      await fetchBranchInstructors();
      setSelectedInstructorId(null);
    } catch (err) {
      console.error("Error agregando instructor:", err);
      toast.error("No se pudo agregar el instructor");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInstructor = async (instructorId: string) => {
    if (!token || !branchId || !instructorId) {
      return;
    }

    try {
      setLoading(true);
      await api.instructor.removeBranchInstructor(
        branchId,
        instructorId,
        token,
      );
      toast.success("Instructor eliminado correctamente");
      await fetchBranchInstructors();
    } catch (err) {
      console.error("❌ Error eliminando instructor:", err);
      toast.error("No se pudo eliminar el instructor");
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
          className="sm:mt-0 mt-2"
        >
          {loading ? "Cargando..." : "Agregar"}
        </Button>
      </div>

      {/* 🔹 Lista de instructores asignados */}
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
