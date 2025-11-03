"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CreateRoles from "./CreateRoles";
import EditRoles from "./EditRoles";
import ViewRoles from "./ViewRoles";
import RolesTable from "./RolesTable";

export default function Roles() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoles, setEditingRoles] = useState<Roles | null>(null);
  const [viewRoles, setViewRoles] = useState<Roles | null>(null);

  if (showCreateForm) {
    return <CreateRoles onBack={() => setShowCreateForm(false)} />;
  }

  if (editingRoles) {
    return (
      <EditRoles roles={editingRoles} onBack={() => setEditingRoles(null)} />
    );
  }

  if (viewRoles) {
    return <ViewRoles roles={viewRoles} onBack={() => setViewRoles(null)} />;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="ROLES Y PERMISOS">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Crear
        </Button>
      </PageHeader>

      <RolesTable
        onView={(role) => setViewRoles(role)}
        onEdit={(role) => setEditingRoles(role)}
      />
    </div>
  );
}
