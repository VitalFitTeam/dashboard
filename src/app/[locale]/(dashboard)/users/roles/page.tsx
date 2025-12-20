"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslations } from "next-intl";
import type { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import RolesTable from "./RolesTable";

export default function Roles() {
  const t = useTranslations("roles");
  const { token } = useAuth();
  const router = useRouter();

  if (!token) {
    return;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title={t("title")}>
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/users/roles/new")}
        >
          <PlusIcon className="h-5 w-5" />
          {t("add_button")}
        </Button>
      </PageHeader>

      <RolesTable />
    </div>
  );
}
