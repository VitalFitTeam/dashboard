"use client";
import PromotionsTable from "./PromotionsTable";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PlusIcon } from "@heroicons/react/24/outline";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";

// Tipos de datos
import { Promotion } from "./PromotionsTable";

type PromotionStatusCount = {
  Active: number;
  Inactive: number;
  Expired: number;
  Total: number;
};

type PaginatedPromotion = Promotion & {
  id: string;
};

const statCardsConfig: {
  title: string;
  valueKey: keyof PromotionStatusCount | "Total";
}[] = [
  { title: "Total", valueKey: "Total" },
  { title: "Activos", valueKey: "Active" },
  { title: "Inactivos", valueKey: "Inactive" },
];

export default function PromotionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingPromos, setIsLoadingPromos] = useState(true);

  const [statsData, setStatsData] = useState<PromotionStatusCount>({
    Active: 0,
    Inactive: 0,
    Expired: 0,
    Total: 0,
  });

  const [promotionsData, setPromotionsData] = useState<PaginatedPromotion[]>(
    [],
  );
  const [filters, setFilters] = useState<Record<string, string | undefined>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [totalPromotions, setTotalPromotions] = useState(0);
  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalPromotions / pageSize)) : 1;

  const handleFilterChange = (key: string, value: string | undefined) => {
    setPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setShowSuccessAlert(true);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  // 🔹 Simulación de carga de datos (mock)
  useEffect(() => {
    setIsLoadingPromos(true);

    // Dummy data para llenar la tabla
    const dummyPromotions = [
      {
        id: "1",
        code: "VERANO25",
        name: "Promo Verano 25%",
        type: "Porcentaje",
        discount: "25%",
        endDate: "2025-09-30",
        status: "Active",
      },
      {
        id: "2",
        code: "BIENVENIDA",
        name: "Bono de Bienvenida",
        type: "Monto Fijo",
        discount: "$10.00",
        endDate: "2026-01-01",
        status: "Inactive",
      },
      {
        id: "3",
        code: "FLASH30",
        name: "Venta Flash 30%",
        type: "Porcentaje",
        discount: "30%",
        endDate: "2025-11-15",
        status: "Active",
      },
    ];

    const dummyStats: PromotionStatusCount = {
      Active: 2,
      Inactive: 1,
      Expired: 0,
      Total: 3,
    };

    // Simulación de carga
    setTimeout(() => {
      setPromotionsData(dummyPromotions);
      setStatsData(dummyStats);
      setTotalPromotions(dummyStats.Total);
      setIsLoadingPromos(false);
    }, 700);
  }, [page, pageSize, sort, filters, refreshKey]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* 🔹 Encabezado con botón */}
      <PageHeader title="PROMOCIONES Y DESCUENTOS">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Promoción y Descuento
        </Button>
      </PageHeader>

      {/* 🔹 Tarjetas de estado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={
              <>
                {card.valueKey === "Total"
                  ? statsData.Active + statsData.Inactive + statsData.Expired
                  : (statsData[card.valueKey] ?? 0)}
                <span className="ml-1.5 text-base font-normal">PROMOS</span>
              </>
            }
            highlight={
              card.valueKey === "Active"
                ? "text-green-600"
                : card.valueKey === "Inactive"
                  ? "text-red-600"
                  : "text-gray-800"
            }
          />
        ))}
      </div>

      {/* 🔹 Tabla de datos */}
      <PromotionsTable
        data={promotionsData}
        isLoading={isLoadingPromos}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onFilterChange={handleFilterChange}
        filterValues={filters}
      />

      {/* 🔹 Modal de creación */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              Crear Promoción o Descuento
            </h2>
            <p className="text-gray-600 mb-6">
              Aquí podrás agregar la información de la nueva promoción.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleFormSuccess}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Alert de confirmación */}
      <GeneralAlertDialog
        open={showSuccessAlert}
        onOpenChange={setShowSuccessAlert}
        trigger={<span />}
        type="info"
        title="¡Promoción Creada!"
        description="La nueva promoción ha sido guardada exitosamente."
        actionText="Continuar"
      />
    </div>
  );
}
