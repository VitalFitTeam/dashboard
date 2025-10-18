"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { TabSelector } from "./TabSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Branches, BranchOperatingHours, DayOfWeek } from "@/types/branches";
import GeneralPanel from "./branches/details/GeneralPanel";
import PaymentMethodPanel from "./branches/details/PaymentMethodsPanel";
import EquipmentPanel from "./branches/details/EquipmentPanel";
import InstructorsPanel from "./branches/details/InstructorsPanel";
import ServicesPanel from "./branches/details/ServicesPanel";
import SchedulePanel from "./branches/details/SchedulePanel";

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchData: Branches | null;
}

export default function BranchDetailsModal({
  isOpen,
  onClose,
  branchData,
}: BranchDetailsModalProps) {
  if (!isOpen || !branchData) {
    return null;
  }

  const [formData, setFormData] = useState<Branches>(branchData);
  const defaultSchedule: BranchOperatingHours[] = (
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ] as DayOfWeek[]
  ).map((day) => ({
    dayOfWeek: day,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: day === "Sunday",
  }));

  const [schedule, setSchedule] = useState<BranchOperatingHours[]>(
    branchData.operatingHours?.length
      ? branchData.operatingHours
      : defaultSchedule,
  );

  useEffect(() => {
    setFormData(branchData);
    setSchedule(
      branchData.operatingHours?.length
        ? branchData.operatingHours
        : defaultSchedule,
    );
  }, [branchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleScheduleChange = (updatedSchedule: BranchOperatingHours[]) => {
    setSchedule(updatedSchedule);
    setFormData((prevData) => ({
      ...prevData!,
      operatingHours: updatedSchedule,
    }));
  };

  const tabItems = [
    {
      value: "general",
      label: "General",
      content: <GeneralPanel formData={formData} handleChange={handleChange} />,
    },
    {
      value: "schedule",
      label: "Horarios",
      content: (
        <SchedulePanel
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
        />
      ),
    },
    {
      value: "payment",
      label: "Métodos de pago",
      content: (
        <PaymentMethodPanel formData={formData} handleChange={handleChange} />
      ),
    },
    {
      value: "services",
      label: "Servicios",
      content: (
        <ServicesPanel formData={formData} handleChange={handleChange} />
      ),
    },
    {
      value: "instructors",
      label: "Instructores",
      content: (
        <InstructorsPanel formData={formData} handleChange={handleChange} />
      ),
    },
    {
      value: "equipment",
      label: "Equipamiento",
      content: (
        <EquipmentPanel formData={formData} handleChange={handleChange} />
      ),
    },
  ];

  return (
    <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-lg border rounded-lg">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Detalles de sucursal
            </h2>
            <p className="text-sm text-gray-500">{formData.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Activa
            </span>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-gray-700 flex-shrink-0"
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto">
          <TabSelector tabs={tabItems} defaultValue="general" />
        </CardContent>

        <CardFooter className="flex justify-end space-x-3 pt-6 bg-gray-50">
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Eliminar sucursal
          </Button>
          <Button className="bg-[#F58025] hover:bg-[#E07122] text-white">
            Modificar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
