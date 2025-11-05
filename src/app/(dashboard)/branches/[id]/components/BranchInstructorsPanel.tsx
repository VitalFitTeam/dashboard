"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { BranchInstructorInfo } from "@vitalfit/sdk";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EntityItem from "@/components/features/EntityItem";

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
  const [allInstructors, setAllInstructors] = useState<BranchInstructorInfo[]>(
    [],
  );
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null
  >(null);
  const [search, setSearch] = useState("");

  // Cargar instructores de la sucursal
  useEffect(() => {
    if (!token || !branchId) {
      return;
    }

    const fetchBranchInstructors = async () => {
      try {
        const res = await api.instructor.getBranchInstructors(
          branchId,
          { search },
          token,
        );
        const mapped: BranchInstructorInfo[] = (res.data || []).map(
          (i: any) => ({
            name: i.instructor_name,
            instructorID: i.instructor_id,
            email: i.email,
            phone: i.phone,
          }),
        );
        setBranchInstructors(mapped);
      } catch (err) {
        console.error("Error cargando instructores de la sucursal:", err);
      }
    };

    fetchBranchInstructors();
  }, [branchId, token, search]);

  // Cargar todos los instructores disponibles
  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchAllInstructors = async () => {
      try {
        const res = await api.instructor.getInstructors({ search }, token);
        const mapped: BranchInstructorInfo[] = (res.data || []).map(
          (i: any) => ({
            name: i.instructor_name,
            instructorID: i.instructor_id,
            email: i.email,
            phone: i.phone,
          }),
        );
        console.log(mapped);
        setAllInstructors(mapped);
      } catch (err) {
        console.error("Error cargando todos los instructores:", err);
      }
    };

    fetchAllInstructors();
  }, [token, search]);

  const handleAddInstructor = async () => {
    if (!token || !selectedInstructorId) {
      return;
    }

    try {
      await api.instructor.addBranchInstructor(
        branchId,
        [selectedInstructorId],
        token,
      );

      // Actualizamos el listado local
      const instructorToAdd = allInstructors.find(
        (i) => i.instructorID === selectedInstructorId,
      );
      if (instructorToAdd) {
        setBranchInstructors((prev) => [...prev, instructorToAdd]);
        setSelectedInstructorId(null);
      }

      alert("Instructor agregado correctamente");
    } catch (err) {
      console.error("Error agregando instructor:", err);
      alert("No se pudo agregar el instructor");
    }
  };

  const handleRemoveInstructor = (instructorID: string) => {
    setBranchInstructors((prev) =>
      prev.filter((i) => i.instructorID !== instructorID),
    );
  };

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
                <SelectItem key={instr.instructorID} value={instr.instructorID}>
                  {instr.name || "Error al mostrar nombre"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          onClick={handleAddInstructor}
          disabled={!selectedInstructorId}
          className="sm:mt-0 mt-2"
        >
          Agregar
        </Button>
      </div>

      <div className="space-y-2">
        {branchInstructors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay instructores asignados a esta sucursal.
          </p>
        ) : (
          branchInstructors.map((instr) => (
            <EntityItem
              key={instr.instructorID}
              initials={`${instr.name?.split(" ")[0]?.[0] ?? "?"}${instr.name?.split(" ")[1]?.[0] ?? "?"}`}
              title={instr.name ?? "Sin nombre"}
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
