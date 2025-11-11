"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Membership } from "@/models/membership";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { MembershipType } from "@vitalfit/sdk";
import { StatCard } from "@/components/ui/StatCard";
import MembershipTable from "./MembershipTable";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/sdk-config";

export default function Membership() {
  const router = useRouter();
  const { token } = useAuth();

  if (!token) {
    router.push("/login");
  }

  const [membershipData, setMembershipData] = useState<MembershipType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [activeItems, setActiveItems] = useState(0);
  const [inactiveItems, setInactiveItems] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    const loadMembershipData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await api.membership.getMembershipTypes(token, {
          limit: pageSize,
          page: page,
          search: filters.search || undefined,
        });

        setMembershipData(result.data || []);
        setTotalItems(result.total || 0);
        const activeItems = result.data.filter((m) => m.is_active);
        const inactiveItems = result.data.filter((m) => !m.is_active);
        setActiveItems(activeItems.length);
        setInactiveItems(inactiveItems.length);
      } catch (error) {
        console.error("Error cargando membresia:", error);
        setMembershipData([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembershipData();
  }, [token, pageSize, filters, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const statsData = {
    total: totalItems,
    active: activeItems,
    inactive: inactiveItems,
  };

  const statCardsConfig = [
    {
      title: "Total",
      valueKey: "total" as keyof typeof statsData,
      fontColor: "text-black-600",
    },
    {
      title: "Activas",
      valueKey: "active" as keyof typeof statsData,
      fontColor: "text-green-600",
    },
    {
      title: "Inactivas",
      valueKey: "inactive" as keyof typeof statsData,
      fontColor: "text-primary",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {isLoading ? (
        <div className="text-center p-4">Cargando estadísticas...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          {statCardsConfig.map((card) => (
            <StatCard
              key={card.title}
              title={card.title.toUpperCase()}
              value={
                <>
                  <h2 className={`ml-1.5 ${card.fontColor}`}>
                    {statsData[card.valueKey]} MEMBRESÍAS
                  </h2>
                </>
              }
            />
          ))}
        </div>
      )}
      <PageHeader title="MEMBRESÍA">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/memberships/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar una membresía
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando Membresías...</div>
      ) : (
        <MembershipTable
          data={membershipData}
          onReload={() => router.push("/memberships")}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
    </div>
  );
}
