"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import UsersTable from "./UsersTable";


export default function UsersPage() {
  const { token } = useAuth();
  const router = useRouter();

  if (!token) {
    return;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="USUARIOS">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.replace("/users/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Usuario
        </Button>
      </PageHeader>

      <UsersTable />
    </div>
  );
}
