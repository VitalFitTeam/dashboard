"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { MembershipType } from "@vitalfit/sdk";
import MembershipTable from "./MembershipTable";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/sdk-config";
import { useTranslations } from "next-intl";

export default function Membership() {
  const t = useTranslations("catalog.memberships");
  const router = useRouter();
  const { token } = useAuth();

  const [membershipData, setMembershipData] = useState<MembershipType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    const loadMembershipData = async () => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await api.membership.getMembershipTypes(token, {
          page,
          limit: pageSize,
          sort: "desc",
          search: filters.search || undefined,
        });

        setMembershipData(result.data || []);
        setTotalItems(result.total || 0);
      } catch (error) {
        console.error("Error cargando membresías:", error);
        setMembershipData([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembershipData();
  }, [token, page, pageSize, filters.search, reloadFlag]);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleFilterChange = (newFilters: { search?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleReload = () => {
    setReloadFlag((prev) => prev + 1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title={t("title")}>
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/catalog/memberships/new")}
        >
          <PlusIcon className="h-5 w-5" />
          {t("add_button")}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">{t("loading")}</div>
      ) : (
        <MembershipTable
          data={membershipData}
          page={page}
          onReload={handleReload}
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
