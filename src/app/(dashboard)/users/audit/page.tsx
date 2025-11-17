"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import RolesTable from "./RolesTable";

export default function Roles() {
  const { token } = useAuth();
  const router = useRouter();

  if (!token) {
    return;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="ROLES Y PERMISOS">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/users/audit/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar un rol
        </Button>
      </PageHeader>

      <RolesTable />
    </div>
  );
}
