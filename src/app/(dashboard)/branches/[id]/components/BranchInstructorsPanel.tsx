"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { BranchInstructorInfo } from "@vitalfit/sdk";
import EntityItem from "@/components/features/EntityItem";

interface BranchInstructorListProps {
  branchId: string;
}

export default function BranchInstructorList({
  branchId,
}: BranchInstructorListProps) {
  const { token } = useAuth();
  const [instructors, setInstructors] = useState<BranchInstructorInfo[]>([]);
  const [search, setSearch] = useState("");

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

        // Mapear los datos reales de la API al tipo BranchInstructorInfo
        const mapped: BranchInstructorInfo[] = (res.data || []).map(
          (i: any) => ({
            name: i.instructor_name, // aquí mapeamos instructor_name → name
            instructorID: i.instructor_id, // instructor_id → instructorID
            email: i.email,
            phone: i.phone,
          }),
        );

        console.log("✅ Instructores cargados correctamente", mapped);
        setInstructors(mapped);
      } catch (err) {
        console.error("Error cargando instructores de la sucursal:", err);
      }
    };

    fetchBranchInstructors();
  }, [branchId, token, search]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Buscar instructor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border p-2 mb-4"
      />

      {instructors.map((instr) => (
        <EntityItem
          key={instr.instructorID}
          initials={`${instr.name?.split(" ")[0]?.[0] ?? "?"}${instr.name?.split(" ")[1]?.[0] ?? "?"}`}
          title={instr.name ?? "Sin nombre"}
          description={instr.email}
          action={
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() =>
                alert(`Eliminar instructor ${instr.name ?? "Sin nombre"}`)
              }
            >
              Eliminar
            </button>
          }
        />
      ))}
    </div>
  );
}
