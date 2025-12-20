"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { PaymentMethod } from "@vitalfit/sdk";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Notification } from "@/components/ui/Notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentTableProps {
  onStatsUpdate?: (paymentMethods: PaymentMethod[]) => void;
}

export default function PaymentTable({ onStatsUpdate }: PaymentTableProps) {
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  // Memoizar la función getFilteredData para evitar recreaciones innecesarias
  const getFilteredData = useCallback(() => {
    let filtered = data;

    if (filters.search) {
      filtered = filtered.filter(
        (payment) =>
          payment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()),
      );
    }

    if (filters.type) {
      filtered = filtered.filter((payment) => payment.type === filters.type);
    }

    if (filters.status) {
      if (filters.status === "active") {
        filtered = filtered.filter((payment) => payment.global_status === true);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter(
          (payment) => payment.global_status === false,
        );
      }
    }

    return filtered;
  }, [data, filters.search, filters.type, filters.status]);

  // Función para notificar estadísticas
  const notifyStats = useCallback(
    (paymentMethods: PaymentMethod[]) => {
      if (onStatsUpdate) {
        onStatsUpdate(paymentMethods);
      }
    },
    [onStatsUpdate],
  );

  const fetchPaymentMethods = async () => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const response = await api.paymentMethod.getPaymentMethods(token);
      const paymentMethods = response.data || [];
      setData(paymentMethods);

      const totalItems = paymentMethods.length;
      setTotalPages(Math.ceil(totalItems / pageSize));

      notifyStats(paymentMethods);
    } catch (error) {
      console.error("Error cargando métodos de pago:", error);
      setNotification({
        isVisible: true,
        description: "Error al cargar los métodos de pago",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [page, token]);

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

  useEffect(() => {
    const filteredData = getFilteredData();
    notifyStats(filteredData);
  }, [getFilteredData, notifyStats]);

  const handleTypeChange = (type: string) => {
    const newType = type === "all" ? "" : type;
    setFilters((prev) => ({ ...prev, type: newType }));
  };

  const handleStatusChange = (status: string) => {
    const newStatus = status === "all" ? "" : status;
    setFilters((prev) => ({ ...prev, status: newStatus }));
  };

  const filteredData = getFilteredData();

  const handleView = (row: PaymentMethod) => {
    router.push(`/payment-methods/${row.method_id}`);
  };

  const handleEdit = (row: PaymentMethod) => {
    router.push(`/payment-methods/${row.method_id}/edit`);
  };

  const handleDeletePaymentMethod = async (payment: PaymentMethod) => {
    if (!token) {
      setDeleteRowId(null);
      return;
    }
    try {
      await api.paymentMethod.deletePaymentMethod(payment.method_id, token);

      setNotification({
        isVisible: true,
        description: "Método de pago eliminado exitosamente",
        title: "Éxito",
      });

      setDeleteRowId(null);

      setTimeout(() => {
        fetchPaymentMethods();
      }, 1000);
    } catch (error) {
      console.error("Error al eliminar el método de pago:", error);
      setDeleteRowId(null);

      setNotification({
        isVisible: true,
        description: "Error al eliminar el método de pago",
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

  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      Cash: "Efectivo",
      Card: "Tarjeta",
      Transfer: "Transferencia",
      Other: "Otro",
    };
    return typeMap[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      Cash: "text-green-800 border-green-200",
      Card: "text-blue-800 border-blue-200",
      Transfer: "text-orange-800 border-orange-200",
      Other: "text-orange-800 border-orange-200",
    };

    const colorClass =
      typeColors[type] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      >
        {getTypeDisplayName(type)}
      </span>
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status
            ? "text-green-800 border-green-200"
            : "text-red-800 border-red-200"
          }`}
      >
        {status ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const columns: Column<PaymentMethod>[] = [
    /*{
      header: "ID",
      accessor: "method_id",
      render: (id) => (
        <div className="w-28 truncate font-mono text-sm" title={id as string}>
          {id as string}
        </div>
      ),
    },
    */
    {
      header: "Nombre",
      accessor: "name",
      filterType: "text",
    },
    {
      header: "Tipo",
      accessor: "type",
      filterType: "text",
      render: (type) => getTypeBadge(type as string),
    },
    {
      header: "Descripción",
      accessor: "description",
      filterType: "text",
      render: (description) => {
        if (typeof description === "string" || typeof description === "number") {
          return description.toString() || "-";
        }
        return "-";
      },
    },
    {
      header: "Estado",
      accessor: "global_status",
      filterType: "text",
      render: (status) => getStatusBadge(status as boolean),
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando métodos de pago...</div>
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
              value={filters.type || "all"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Cash">Efectivo</SelectItem>
                <SelectItem value="Card">Tarjeta</SelectItem>
                <SelectItem value="Transfer">Transferencia</SelectItem>
                <SelectItem value="Other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[200px]">
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={fetchPaymentMethods}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      <DataTable<PaymentMethod>
        key={`payment-methods-${filteredData.length}-${filters.type}-${filters.status}-${filters.search}`}
        columns={columns}
        data={filteredData}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        rowIdKey="method_id"
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
                  onClick: () => setDeleteRowId(row.method_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.method_id && (
              <GeneralAlertDialog
                open={deleteRowId === row.method_id}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeletePaymentMethod(row)}
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
