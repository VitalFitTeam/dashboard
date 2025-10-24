"use client";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import UsersTable from "./UsersTable";

const statsData = {
  total: 100,
  active: 70,
  inactive: 20,
  maintenance: 10,
};

const statCardsConfig = [
  {
    title: "Total",
    valueKey: "total" as keyof typeof statsData,
  },
  {
    title: "Activas",
    valueKey: "active" as keyof typeof statsData,
  },
  {
    title: "Inactivas",
    valueKey: "inactive" as keyof typeof statsData,
  },
  {
    title: "Mantenimiento",
    valueKey: "maintenance" as keyof typeof statsData,
  },
];

export default function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="USUARIOS ADMINISTRATIVOS">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Usuario
        </Button>
      </PageHeader>

      <UsersTable />
    </div>
  );
}
