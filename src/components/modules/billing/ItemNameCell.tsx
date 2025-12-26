"use client";
import { useAuth } from "@/context/AuthContext";
import useGetMembership from "@/hooks/membership/useGetMembership";
import useGetPackage from "@/hooks/packages/useGetPackage";

interface ItemNameCellProps {
  item: {
    membership_type_id?: string;
    package_id?: string;
    service_id?: string; 
  };
}

export function ItemNameCell({ item }: ItemNameCellProps) {
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
          {membershipDetail?.name || "Membresía"}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">Membresía</span>
      </div>
    );
  }

  if (item.package_id) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {packageDetail?.name || "Paquete de Clases"}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">Paquete</span>
      </div>
    );
  }

  return <span className="text-sm">Ítem Desconocido</span>;
}