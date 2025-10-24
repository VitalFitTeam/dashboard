"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BranchOperatingHours, DayOfWeek } from "@/models/branches";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Input } from "@/components/ui/Input";

interface BranchScheduleProps {
  schedule: BranchOperatingHours[];
  onScheduleChange: (updatedSchedule: BranchOperatingHours[]) => void;
  mode: "view" | "edit";
}

const dayNameMapping: Record<DayOfWeek, string> = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo",
};

export default function BranchSchedule({
  schedule,
  onScheduleChange,
  mode,
}: BranchScheduleProps) {
  const isDisabled = mode === "view";

  const handleTimeChange = (
    dayOfWeek: DayOfWeek,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    const updatedSchedule = schedule.map((day) =>
      day.dayOfWeek === dayOfWeek
        ? { ...day, [field]: value, isClosed: false }
        : day,
    );
    onScheduleChange(updatedSchedule);
  };

  const handleCheckboxChange = (dayOfWeek: DayOfWeek, checked: boolean) => {
    const updatedSchedule = schedule.map((day) =>
      day.dayOfWeek === dayOfWeek
        ? { ...day, isClosed: checked, openTime: null, closeTime: null }
        : day,
    );
    onScheduleChange(updatedSchedule);
  };

  const columns: Column<BranchOperatingHours>[] = [
    {
      header: "Día",
      accessor: "dayOfWeek",
      render: (value) => dayNameMapping[value as DayOfWeek],
    },
    {
      header: "Apertura",
      accessor: "openTime",
      render: (value, row) => (
        <div className="relative w-36">
          <Input
            type="time"
            value={(value as string | null) ?? ""}
            onChange={(e) =>
              handleTimeChange(row.dayOfWeek, "openTime", e.target.value)
            }
            disabled={isDisabled || row.isClosed}
            className="pr-8"
          />
          <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      ),
    },
    {
      header: "Cierre",
      accessor: "closeTime",
      render: (value, row) => (
        <div className="relative w-36">
          <Input
            type="time"
            value={(value as string | null) ?? ""}
            onChange={(e) =>
              handleTimeChange(row.dayOfWeek, "closeTime", e.target.value)
            }
            disabled={isDisabled || row.isClosed}
            className="pr-8"
          />
          <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      ),
    },
    {
      header: "Cerrado",
      accessor: "isClosed",
      render: (value, row) => (
        <div className="flex justify-center">
          <Checkbox
            checked={value as boolean}
            onCheckedChange={(checked) =>
              handleCheckboxChange(row.dayOfWeek, !!checked)
            }
            disabled={isDisabled}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pt-4">
      <DataTable columns={columns} data={schedule} enableRowSelection={false} />
    </div>
  );
}
