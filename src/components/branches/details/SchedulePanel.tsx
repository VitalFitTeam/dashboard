"use client";

import { BranchOperatingHours } from "@/types/branches";
import React from "react";
import BranchSchedule from "./BranchSchedule";
import PanelWrapper from "./PanelWrapper";

interface SchedulePanelProps {
  schedule: BranchOperatingHours[];
  onScheduleChange: (updatedSchedule: BranchOperatingHours[]) => void;
}

export default function SchedulePanel({
  schedule,
  onScheduleChange,
}: SchedulePanelProps) {
  return (
    <PanelWrapper
      title="Horario de Operación"
      description="Gestiona los horarios de apertura y cierre de la sucursal para cada día de la semana."
    >
      <BranchSchedule schedule={schedule} onScheduleChange={onScheduleChange} />
    </PanelWrapper>
  );
}
