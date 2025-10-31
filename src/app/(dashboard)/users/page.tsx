"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import UsersTable from "./UsersTable";

export default function Users() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="USUARIOS">
        <Button variant="primary">
          <PlusIcon className="h-5 w-5" />
          Agregar Usuario
        </Button>
      </PageHeader>

      <UsersTable />
    </div>
  );
}
