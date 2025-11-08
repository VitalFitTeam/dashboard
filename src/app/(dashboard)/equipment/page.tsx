"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateEquipment from "./CreateEquipment";
import EditEquipment from "./EditEquipment";
import ViewDetailsEquipment from "./ViewDetailsEquipment";
import EquipmentTable from "./EquipmentTable";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Equipment as EquipmentType } from "@vitalfit/sdk";

// Define el tipo de respuesta esperado de la API
type EquipmentListResponse = { data: EquipmentType[] };

export default function Equipment() {
  // --- Estados de Navegación y Vistas ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEquipment, setEditingEquipment] =
    useState<EquipmentType | null>(null);
  const [viewEquipment, setViewEquipment] = useState<EquipmentType | null>(
    null,
  );
  const { token } = useAuth();

  // --- Estados de Datos y Carga ---
  const [equipmentData, setEquipmentData] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Estados de Paginación (Controlada por el Padre) ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0); // Renombrado de totalUsers a totalItems

  // Cálculo del total de páginas (necesario para la PaginationControls)
  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;

  // 1. FUNCIÓN DE CARGA CENTRALIZADA Y CON ENVOLTURA CALLBACK
  const loadEquipmentData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result: EquipmentListResponse = await api.equipment.getEquipment(
        token,
        {
          limit: pageSize,
          page,
        },
      );

      setEquipmentData(result.data);
      setTotalItems(result.data.length); // Usamos la longitud de los datos
    } catch (error) {
      console.error("Error cargando equipamiento:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // 2. EFECTO: Llama a loadEquipmentData al montar
  useEffect(() => {
    loadEquipmentData();
  }, [loadEquipmentData]);

  // 3. FUNCIÓN DE RETORNO Y RECARGA (CRUD)
  const handleBackAndReload = () => {
    setShowCreateForm(false);
    setEditingEquipment(null);
    setViewEquipment(null);
    setPage(1); // Siempre volvemos a la primera página tras un cambio/recarga
    loadEquipmentData();
  };

  // --- Renderizado Condicional de Vistas ---

  if (showCreateForm) {
    return <CreateEquipment onBack={handleBackAndReload} />;
  }
  if (editingEquipment) {
    return (
      <EditEquipment
        equipment={editingEquipment}
        onBack={handleBackAndReload}
      />
    );
  }
  if (viewEquipment) {
    return (
      <ViewDetailsEquipment
        equipment={viewEquipment}
        onBack={handleBackAndReload}
      />
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="EQUIPAMIENTO">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Equipamiento
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando equipamiento...</div>
      ) : (
        <EquipmentTable
          data={equipmentData}
          onReload={loadEquipmentData}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          totalPages={totalPages}
          onView={(equipment) => setViewEquipment(equipment)}
          onEdit={(equipment) => setEditingEquipment(equipment)}
        />
      )}
    </div>
  );
}
