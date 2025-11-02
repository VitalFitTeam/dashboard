"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Users } from "@/models/users";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateUser from "./CreateUser";
import ViewDetailsUser from "./ViewDetailsUser";
import EditUser from "./EditUser";
import { useState } from "react";
import UsersTable from "./UsersTable";

export default function User() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Users | null>(null);
  const [viewUser, setViewUser] = useState<Users | null>(null);

  if (showCreateForm) {
    return <CreateUser onBack={() => setShowCreateForm(false)} />;
  }

  if (editingUser) {
    return <EditUser user={editingUser} onBack={() => setEditingUser(null)} />;
  }

  if (viewUser) {
    return <ViewDetailsUser user={viewUser} onBack={() => setViewUser(null)} />;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="USUARIOS">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Usuario
        </Button>
      </PageHeader>

      <UsersTable
        onView={(user) => setViewUser(user)}
        onEdit={(user) => setEditingUser(user)}
      />
    </div>
  );
}
