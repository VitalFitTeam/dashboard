"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { StarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { ServiceFullDetail, ServiceCategoryInfo } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Notification } from "@/components/ui/Notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatsData {
  total: number;
  featured: number;
}

interface ServicesTableProps {
  onServiceUpdate?: (stats: StatsData) => void;
}

export default function ServicesTable({ onServiceUpdate }: ServicesTableProps) {
  const [data, setData] = useState<ServiceFullDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState<ServiceCategoryInfo[]>([]);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<StatsData>({ total: 0, featured: 0 });

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  const loadServices = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.products.getServices(token, { page });
      const services = response.data || [];
      setData(services);

      const totalItems = services.length;
      setTotalPages(Math.ceil(totalItems / pageSize));
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setNotification({
        isVisible: true,
        description: "Error al cargar los servicios",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await api.products.getCategories(token);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  useEffect(() => {
    if (token) {
      loadServices();
      loadCategories();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadServices();
    }
  }, [page, token]);

  // Calcular stats cuando cambien los datos o filtros
  useEffect(() => {
    const filteredData = getFilteredData();
    const newStats = {
      total: filteredData.length,
      featured: filteredData.filter((service) => service.is_featured).length,
    };

    setStats(newStats);

    if (onServiceUpdate) {
      onServiceUpdate(newStats);
    }
  }, [data, filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput.trim() === "") {
        if (filters.search !== "") {
          setFilters((prev) => ({ ...prev, search: "" }));
        }
      } else if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput }));
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput, filters.search]);

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId === "all" ? "" : categoryId;
    setFilters((prev) => ({ ...prev, category: newCategory }));
  };

  const getFilteredData = () => {
    let filtered = data;

    if (filters.search) {
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (service) => service.service_category?.category_id === filters.category,
      );
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  const handleView = (row: ServiceFullDetail) => {
    router.push(`/services/${row.service_id}`);
  };

  const handleEdit = (row: ServiceFullDetail) => {
    router.push(`/services/${row.service_id}/edit`);
  };

  const handleDeleteService = async (service: ServiceFullDetail) => {
    if (!token) {
      setDeleteRowId(null);
      return;
    }
    try {
      await api.products.deleteService(service.service_id, token);

      setNotification({
        isVisible: true,
        description: "Servicio borrado exitosamente",
        title: "Éxito",
      });

      setDeleteRowId(null);

      setTimeout(() => {
        loadServices();
      }, 1000);
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      setDeleteRowId(null);

      setNotification({
        isVisible: true,
        description: "Error al borrar el servicio",
        title: "Error",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const formatDuration = (duration: number) => {
    return `${duration}min`;
  };

  const getFeaturedIcon = (isFeatured: boolean) => {
    return isFeatured ? (
      <StarIcon className="h-5 w-5 fill-black text-black" />
    ) : (
      <StarIcon className="h-5 w-5 text-black" />
    );
  };

  const getCategoryName = (serviceCategory: ServiceCategoryInfo) => {
    return serviceCategory?.name || "Sin categoría";
  };

  const visibleColumns: Column<ServiceFullDetail>[] = [
    {
      header: "Nombre",
      accessor: "name",
      filterType: "text",
    },
    {
      header: "Categoría",
      accessor: "service_category",
      render: (category) => (
        <div className="max-w-[150px] truncate">
          {getCategoryName(category as ServiceCategoryInfo)}
        </div>
      ),
    },
    {
      header: "Duración",
      accessor: "duration_minutes",
      render: (duration) => (
        <span className="text-sm font-medium">
          {formatDuration(duration as number)}
        </span>
      ),
    },
    {
      header: "Destacado",
      accessor: "is_featured",
      render: (isFeatured) => (
        <div className="flex justify-center">
          {getFeaturedIcon(isFeatured as boolean)}
        </div>
      ),
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando servicios...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative w-full sm:w-[250px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filtrar por nombre"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <Select
              value={filters.category || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={loadServices} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Descargando..." : "Descargar"}
          </Button>
        </div>
      </div>

      <DataTable<ServiceFullDetail>
        key={`services-${filteredData.length}-${filters.category}-${filters.search}`}
        columns={visibleColumns}
        data={filteredData}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        rowIdKey="service_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => handleView(row) },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.service_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.service_id && (
              <GeneralAlertDialog
                open={deleteRowId === row.service_id}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeleteService(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />

      {notification.isVisible && (
        <Notification
          title={notification.title}
          description={notification.description}
          onClose={hideNotification}
          autoCloseDuration={3000}
          variant={notification.title === "Error" ? "destructive" : "success"}
        />
      )}
    </>
  );
}