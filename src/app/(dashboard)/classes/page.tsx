"use client";
import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ClassesMethodsPage() {
  const { token } = useAuth();
  const router = useRouter();

  if (!token) {
    return;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="CLASES">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/classes/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar una clase
        </Button>
      </PageHeader>
    </div>
  );
}
