"use client";

import { BranchOperatingHours } from "@/models/branches";
import React from "react";
import BranchSchedule from "./BranchSchedule";
import PanelWrapper from "./PanelWrapper";

interface SchedulePanelProps {
  schedule: BranchOperatingHours[];
  onScheduleChange: (updatedSchedule: BranchOperatingHours[]) => void;
  mode: "view" | "edit";
}

export default function SchedulePanel({
  schedule,
  onScheduleChange,
  mode,
}: SchedulePanelProps) {
  const isDisabled = mode === "view";
  return (
    <PanelWrapper
      title="Horario de Operación"
      description={
        isDisabled
          ? "Horarios de operaciónn de la sucursal."
          : "Configura los horarios para cada día de la semana."
      }
    >
      <BranchSchedule
        schedule={schedule}
        onScheduleChange={onScheduleChange}
        mode={mode}
      />
    </PanelWrapper>
  );
}
