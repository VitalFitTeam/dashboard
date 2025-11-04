"use client";
import { useState, useEffect } from "react";
import PromotionsTable, {
  Promotion,
  CreatePromotionDTO,
  UpdatePromotionDTO,
} from "./PromotionsTable";
import PromotionForm from "./PromotionForm";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PlusIcon } from "@heroicons/react/24/outline";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import AlertConfirm from "@/components/ui/alertConfirm";

// Mock service - reemplaza con tu API real
const promotionService = {
  async getPromotions(
    filters: any = {},
    page: number = 1,
    pageSize: number = 10,
  ) {
    // Simulación de datos mock
    const mockPromotions: Promotion[] = [
      {
        promotion_id: "1",
        code: "VERANO25",
        name: "Promo Verano 25%",
        description: "Descuento especial de verano",
        type: "percentage",
        discount: 25,
        min_amount: 50,
        max_discount: 100,
        start_date: "2025-01-01",
        end_date: "2025-09-30",
        usage_limit: 1000,
        used_count: 250,
        status: "Active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        promotion_id: "2",
        code: "BIENVENIDA",
        name: "Bono de Bienvenida",
        description: "Descuento para nuevos clientes",
        type: "fixed_amount",
        discount: 10,
        min_amount: 30,
        start_date: "2024-01-01",
        end_date: "2026-01-01",
        usage_limit: 5000,
        used_count: 1200,
        status: "Inactive",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        promotion_id: "3",
        code: "FLASH30",
        name: "Venta Flash 30%",
        description: "Promoción flash por tiempo limitado",
        type: "percentage",
        discount: 30,
        min_amount: 20,
        max_discount: 50,
        start_date: "2024-11-01",
        end_date: "2024-11-15",
        usage_limit: 200,
        used_count: 180,
        status: "Expired",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    // Aplicar filtros (simulación)
    let filteredData = mockPromotions;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (promo) =>
          promo.name.toLowerCase().includes(searchLower) ||
          promo.code.toLowerCase().includes(searchLower),
      );
    }

    if (filters.status) {
      filteredData = filteredData.filter(
        (promo) => promo.status === filters.status,
      );
    }

    // Calcular stats
    const stats = {
      Active: mockPromotions.filter((p) => p.status === "Active").length,
      Inactive: mockPromotions.filter((p) => p.status === "Inactive").length,
      Expired: mockPromotions.filter((p) => p.status === "Expired").length,
      Total: mockPromotions.length,
    };

    // Paginación (simulación)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      stats,
    };
  },

  async createPromotion(data: CreatePromotionDTO): Promise<Promotion> {
    // Simulación de creación
    const newPromotion: Promotion = {
      ...data,
      promotion_id: Date.now().toString(),
      used_count: 0,
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // En una implementación real, aquí harías la llamada a la API
    console.log("Creating promotion:", data);
    return newPromotion;
  },

  async updatePromotion(
    id: string,
    data: UpdatePromotionDTO,
  ): Promise<Promotion> {
    // Simulación de actualización
    const updatedPromotion: Promotion = {
      promotion_id: id,
      code: data.code || "",
      name: data.name || "",
      description: data.description,
      type: data.type || "percentage",
      discount: data.discount || 0,
      min_amount: data.min_amount,
      max_discount: data.max_discount,
      start_date: data.start_date || "",
      end_date: data.end_date || "",
      usage_limit: data.usage_limit,
      used_count: 0, // En realidad deberías obtener este valor existente
      status: data.status || "Active",
      created_at: new Date().toISOString(), // En realidad deberías mantener el original
      updated_at: new Date().toISOString(),
    };

    console.log("Updating promotion:", id, data);
    return updatedPromotion;
  },

  async deletePromotion(id: string): Promise<void> {
    // Simulación de eliminación
    console.log("Deleting promotion:", id);
    return Promise.resolve();
  },
};

type PromotionStatusCount = {
  Active: number;
  Inactive: number;
  Expired: number;
  Total: number;
};

export default function PromotionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const [statsData, setStatsData] = useState<PromotionStatusCount>({
    Active: 0,
    Inactive: 0,
    Expired: 0,
    Total: 0,
  });

  const [promotionsData, setPromotionsData] = useState<Promotion[]>([]);
  const [filters, setFilters] = useState<Record<string, string | undefined>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPromotions, setTotalPromotions] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalPromotions / pageSize));

  // Cargar datos
  useEffect(() => {
    loadPromotions();
  }, [page, pageSize, filters, refreshKey]);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const result = await promotionService.getPromotions(
        filters,
        page,
        pageSize,
      );
      setPromotionsData(result.data);
      setStatsData(result.stats);
      setTotalPromotions(result.total);
    } catch (error) {
      console.error("Error loading promotions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreatePromotionDTO) => {
    setIsSubmitting(true);
    try {
      await promotionService.createPromotion(data);
      setSuccessMessage("Promoción creada exitosamente");
      setShowSuccessAlert(true);
      setRefreshKey((prev) => prev + 1);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Error al crear la promoción");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: UpdatePromotionDTO) => {
    if (!promotion) {return;}

    setIsSubmitting(true);
    try {
      await promotionService.updatePromotion(promotion.promotion_id, data);
      setSuccessMessage("Promoción actualizada exitosamente");
      setShowSuccessAlert(true);
      setRefreshKey((prev) => prev + 1);
      setPromotion(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert("Error al actualizar la promoción");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setPromotion(promotion);
    setShowForm(true);
    setIsViewer(false);
  };
  const handleDelete = (promotion: Promotion) => {
    setPromotion(promotion);
    setAlertOpen(true);
    setShowForm(false);
    setIsViewer(false);
  };

  const handleConfirmDelete = async (promotion: Promotion) => {
    try {
      await promotionService.deletePromotion(promotion.promotion_id);
      setPromotion(null);
      setAlertOpen(false);
      setSuccessMessage("Promoción eliminada exitosamente");
      setShowSuccessAlert(true);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Error al eliminar la promoción");
    }
  };

  const handleCancelDelete = () => {
    setPromotion(null);
    setAlertOpen(false);
    setShowForm(false);
    setIsViewer(false);
  };

  const handleView = (promotion: Promotion) => {
    console.log("Viewing promotion:", promotion);
    setPromotion(promotion);
    setIsViewer(true);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setPromotion(null);
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = (data: CreatePromotionDTO | UpdatePromotionDTO) => {
    if (promotion) {
      return handleUpdate(data as UpdatePromotionDTO);
    } else {
      return handleCreate(data as CreatePromotionDTO);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setShowSuccessAlert(true);
    setRefreshKey((prevKey) => prevKey + 1);
  };
  const statCardsConfig = [
    { title: "Total", valueKey: "Total" as const },
    { title: "Activos", valueKey: "Active" as const },
    { title: "Inactivos", valueKey: "Inactive" as const },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="PROMOCIONES Y DESCUENTOS">
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Promoción
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={
              <>
                {statsData[card.valueKey]}
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

      {/* Tabla */}
      <PromotionsTable
        data={promotionsData}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onFilterChange={handleFilterChange}
        filterValues={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Formulario */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <PromotionForm
            promotion={promotion || undefined}
            isOpen={showForm}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onSuccess={handleFormSuccess}
            isViewer={isViewer}
          />
        </div>
      )}

      {/* Alert de éxito */}
      <GeneralAlertDialog
        open={showSuccessAlert}
        onOpenChange={setShowSuccessAlert}
        type="success"
        title="¡Operación Exitosa!"
        description={successMessage}
        actionText="Continuar"
      />

      <AlertConfirm
        isOpen={alertOpen}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro permanentemente?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  );
}
