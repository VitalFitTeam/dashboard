"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Input } from "@/components/ui/Input";
import { OperatingHour } from "@vitalfit/sdk";

interface BranchScheduleProps {
  schedule: OperatingHour[];

  onScheduleChange: (updatedSchedule: OperatingHour[]) => void;
  mode: "view" | "edit";
}
const dayNameMapping: Record<string, string> = {
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
    day_of_week: string,
    field: "open_time" | "close_time",
    value: string,
  ) => {
    const updatedSchedule = schedule.map((day) =>
      day.day_of_week === day_of_week
        ? { ...day, [field]: value, is_closed: false }
        : day,
    );
    onScheduleChange(updatedSchedule);
  };

  const handleCheckboxChange = (day_of_week: string, checked: boolean) => {
    const updatedSchedule = schedule.map((day) =>
      day.day_of_week === day_of_week
        ? { ...day, is_closed: checked, open_time: "", close_time: "" }
        : day,
    );
    onScheduleChange(updatedSchedule);
  };

  const columns: Column<OperatingHour>[] = [
    {
      header: "Día",
      accessor: "day_of_week", // <-- snake_case
      render: (value) => dayNameMapping[value as string],
    },
    {
      header: "Apertura",
      accessor: "open_time",
      render: (value, row) => (
        <div className="relative w-36">
          <Input
            type="time"
            value={(value as string | null) ?? ""}
            onChange={(e) =>
              handleTimeChange(row.day_of_week, "open_time", e.target.value)
            }
            disabled={isDisabled || row.is_closed}
            className="pr-8"
          />
          <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      ),
    },
    {
      header: "Cierre",
      accessor: "close_time",
      render: (value, row) => (
        <div className="relative w-36">
          <Input
            type="time"
            value={(value as string | null) ?? ""}
            onChange={(e) =>
              handleTimeChange(row.day_of_week, "close_time", e.target.value)
            }
            disabled={isDisabled || row.is_closed}
            className="pr-8"
          />
          <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      ),
    },
    {
      header: "Cerrado",
      accessor: "is_closed",
      render: (value, row) => (
        <div className="flex justify-center">
          <Checkbox
            checked={value as boolean}
            onCheckedChange={(checked) =>
              handleCheckboxChange(row.day_of_week, !!checked)
            }
            disabled={isDisabled}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pt-4">
      <DataTable
        columns={columns}
        data={schedule}
        enableRowSelection={false}
        rowIdKey="hour_id"
      />
    </div>
  );
}
