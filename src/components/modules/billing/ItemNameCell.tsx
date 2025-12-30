"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import useGetMembership from "@/hooks/membership/useGetMembership";
import useGetPackage from "@/hooks/packages/useGetPackage";
import { useTranslations } from "next-intl"; // Importar hook

interface ItemNameCellProps {
  item: {
    membership_type_id?: string;
    package_id?: string;
    service_id?: string; 
  };
}

export function ItemNameCell({ item }: ItemNameCellProps) {
  const t = useTranslations("finance.Billing.itemsTable");
  const { token } = useAuth();

  const { membershipDetail, loading: loadingMember } = useGetMembership(
    item.membership_type_id,
    token
  );

  const { packageDetail, loading: loadingPackage } = useGetPackage(
    item.package_id,
    token
  );

  if (loadingMember || loadingPackage) {
    return <div className="h-4 w-32 bg-muted animate-pulse rounded" />;
  }

  if (item.membership_type_id) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {membershipDetail?.name || t("defaultNames.membership")}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">
          {t("types.membership")}
        </span>
      </div>
    );
  }

  if (item.package_id) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {packageDetail?.name || t("defaultNames.package")}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">
          {t("types.package")}
        </span>
      </div>
    );
  }

  return <span className="text-sm">{t("types.unknown")}</span>;
}