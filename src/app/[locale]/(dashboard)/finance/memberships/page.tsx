"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import ManagementTable from "./ManagementTable";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockMembershipPayments, MembershipPayment } from "./data";

export default function MembershipManagement() {
  const router = useRouter();

  const [paymentsData, setPaymentsData] = useState<MembershipPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startDate: "",
    endDate: ""
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const loadPaymentsData = useCallback(async () => {
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      let filteredData = [...mockMembershipPayments];
      
      // Aplicar filtro de búsqueda
      if (filters.search) {
        filteredData = filteredData.filter(payment => 
          payment.invoice.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.client.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      // Aplicar filtro de status
      if (filters.status !== "all") {
        filteredData = filteredData.filter(payment => 
          payment.status === filters.status
        );
      }
      
      if (filters.startDate && filters.endDate) {
        filteredData = filteredData.filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          const startDate = new Date(filters.startDate);
          const endDate = new Date(filters.endDate);
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      }
      
      setPaymentsData(filteredData);
      setTotalItems(filteredData.length);
      setIsLoading(false);
    }, 500);
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadPaymentsData();
  }, [loadPaymentsData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="GESTIÓN DE MEMBRESÍAS"/>

      {isLoading ? (
        <div className="text-center p-10">Cargando pagos de membresías...</div>
      ) : (
        <ManagementTable
          data={paymentsData}
          onReload={loadPaymentsData}
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