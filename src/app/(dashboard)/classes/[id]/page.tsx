// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import ClassForm from "../ClassesForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { ClassFormData } from "@/lib/validation/class";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Input } from "@/components/ui/Input";
import { Download, Trash2 } from "lucide-react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AttendanceRecord {
  id: string;
  userName: string;
  className: string;
  checkInTime: string;
  status: "Presente" | "Ausente" | "Tardío";
}

interface Branch {
  branch_id: string;
  name: string;
}

interface Service {
  service_id: string;
  name: string;
  description: string;
  duration_minutes: number;
}

interface Instructor {
  instructor_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function ClassDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "attendance">("info");
  const [isLoading, setIsLoading] = useState(true);

  // Estados para la eliminación
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados para los datos de los selects
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Estados para los parámetros de la URL
  const [branchId, setBranchId] = useState<string>("");
  const [dateParam, setDateParam] = useState<string>("");

  const [formData, setFormData] = useState<ClassFormData>({
    service_id: "",
    branch_id: "",
    instructor_id: "",
    max_capacity: "",
    start_date: "",
    start_time: "10:30:00",
    end_date: "",
    end_time: "10:30:00",
  });

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");

  const classId = params.id as string;

  // Extraer parámetros de la URL al montar el componente
  useEffect(() => {
    const branch = searchParams.get("branch");
    const date = searchParams.get("date");

    if (branch) {
      setBranchId(branch);
      setFormData((prev) => ({ ...prev, branch_id: branch }));
    }

    if (date) {
      setDateParam(date);
      setFormData((prev) => ({
        ...prev,
        start_date: date,
        end_date: date,
      }));
    }
  }, [searchParams]);

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      if (!token || !classId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Cargar sucursales
        const branchesResponse = await api.branch.getBranches(
          { page: 1, limit: 100 },
          token,
        );
        if (branchesResponse.data) {
          setBranches(branchesResponse.data);
        }

        // Cargar servicios
        const servicesResponse = await api.products.getServices(token, {
          page: 1,
          limit: 100,
        });
        if (servicesResponse.data) {
          const servicesData = servicesResponse.data.map((service: any) => ({
            service_id: service.service_id,
            name: service.name,
            description: service.description,
            duration_minutes: service.duration_minutes,
          }));
          setServices(servicesData);
        }

        // Cargar instructores
        const instructorsResponse = await api.instructor.getInstructors(
          { page: 1, limit: 100 },
          token,
        );
        if (instructorsResponse.data) {
          const instructorsData = instructorsResponse.data.map(
            (instructor: any) => ({
              instructor_id: instructor.instructor_id,
              first_name: instructor.first_name,
              last_name: instructor.last_name,
              email: instructor.email,
            }),
          );
          setInstructors(instructorsData);
        }

        // Cargar datos de la clase
        const classResponse = await api.schedule.GetClassByID(classId, token);

        if (classResponse.data) {
          const classData = classResponse.data;

          // Formatear las fechas y horas para el formulario
          const startDate = new Date(classData.starts_at);
          const endDate = new Date(classData.ends_at);

          setFormData({
            service_id: classData.service_id || "",
            branch_id: classData.branch_id || branchId,
            instructor_id: classData.instructor_id || "",
            max_capacity: classData.max_capacity?.toString() || "",
            start_date: startDate.toISOString().split("T")[0],
            start_time:
              startDate.toTimeString().split(" ")[0].substring(0, 5) + ":00",
            end_date: endDate.toISOString().split("T")[0],
            end_time:
              endDate.toTimeString().split(" ")[0].substring(0, 5) + ":00",
          });
        } else {
          throw new Error("No se encontraron datos de la clase");
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setNotification({
          isVisible: true,
          description: "Error al cargar los datos de la clase",
          title: "Error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, classId, branchId]);

  // Función para confirmar eliminación
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Función para eliminar la clase - CORREGIDA
  const handleDelete = async () => {
    if (!token || !classId) {
      setDeleteError("Falta información necesaria para eliminar la clase");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Llamar a la API para eliminar la clase
      await api.schedule.DeleteClass(classId, token);

      setDeleteSuccess("Clase eliminada exitosamente");
      setShowDeleteConfirm(false);

      // Mostrar notificación y redirigir inmediatamente
      setNotification({
        isVisible: true,
        description: "Clase eliminada exitosamente",
        title: "Éxito",
      });

      // Redirigir inmediatamente a /classes
      router.push("/classes");
    } catch (error) {
      console.error("Error eliminando clase:", error);
      setDeleteError("Error al eliminar la clase. Intenta nuevamente.");
      setNotification({
        isVisible: true,
        description: "Error al eliminar la clase",
        title: "Error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para cerrar notificación
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Función placeholder para descargar CSV
  const handleDownloadCSV = () => {
    console.log("Descargando CSV...");
  };

  // Función para badges de estado
  const getStatusBadge = (status: string) => {
    const statusColors = {
      Presente: "text-green-800 border-green-200",
      Ausente: "text-red-800 border-red-200",
      Tardío: "text-orange-800 border-orange-200",
    };

    const colorClass =
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  // Datos de prueba para el reporte de asistencia
  const mockAttendanceData: AttendanceRecord[] = [
    {
      id: "1",
      userName: "María González",
      className: "Yoga",
      checkInTime: "2024-01-15 10:25:00",
      status: "Presente",
    },
    {
      id: "2",
      userName: "Carlos Rodríguez",
      className: "Yoga",
      checkInTime: "2024-01-15 10:35:00",
      status: "Tardío",
    },
    {
      id: "3",
      userName: "Ana López",
      className: "Yoga",
      checkInTime: "2024-01-15 10:28:00",
      status: "Presente",
    },
    {
      id: "4",
      userName: "Juan Pérez",
      className: "Yoga",
      checkInTime: "-",
      status: "Ausente",
    },
    {
      id: "5",
      userName: "Laura Martínez",
      className: "Yoga",
      checkInTime: "2024-01-15 10:22:00",
      status: "Presente",
    },
  ];

  const attendanceColumns: Column<AttendanceRecord>[] = [
    {
      header: "Nombre del Usuario",
      accessor: "userName",
      filterType: "text",
    },
    {
      header: "Clase",
      accessor: "className",
      filterType: "text",
    },
    {
      header: "Hora de Check-in",
      accessor: "checkInTime",
      filterType: "text",
    },
    {
      header: "Estado",
      accessor: "status",
      filterType: "text",
      render: (status) => getStatusBadge(status as string),
    },
  ];

  const filteredAttendanceData = mockAttendanceData.filter(
    (record) =>
      record.userName.toLowerCase().includes(searchInput.toLowerCase()) ||
      record.className.toLowerCase().includes(searchInput.toLowerCase()) ||
      record.status.toLowerCase().includes(searchInput.toLowerCase()),
  );

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
        <div className="text-center p-10">Cargando clase...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <PageHeader title="DETALLES DE CLASE">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={confirmDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            router.push(`/classes/${classId}/edit?branch=${branchId}`);
          }}
        >
          Modificar
        </Button>
      </PageHeader>

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <Alert className="border-red-200">
              <AlertTitle className="font-semibold">
                Confirmar Eliminación
              </AlertTitle>
              <AlertDescription className="mt-2">
                ¿Estás seguro de que deseas eliminar esta clase? Esta acción no
                se puede deshacer.
              </AlertDescription>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <Alert className="border-green-300 bg-white text-green-800 mb-4">
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{deleteSuccess}</AlertDescription>
        </Alert>
      )}

      {deleteError && (
        <Alert className="border-red-300 bg-red-50 text-red-800 mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="border-b bg-[#F1F5F9] rounded border-gray-200 p-1">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "bg-white mx-2 rounded"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Información general
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "attendance"
                ? "bg-white mx-2 rounded"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Reporte de asistencia
          </button>
        </nav>
      </div>

      <div className="pt-6">
        {activeTab === "info" ? (
          <ClassForm
            formData={formData}
            errors={{}}
            onChange={() => {}} // Función vacía ya que los campos están deshabilitados
            onBlur={() => {}} // Función vacía ya que los campos están deshabilitados
            branches={branches}
            services={services}
            instructors={instructors}
            disabled={true} // Todos los campos deshabilitados
          />
        ) : (
          <div className="space-y-6">
            {/* Filtros para el reporte de asistencia */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative w-full sm:w-[250px]">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter..."
                    className="pl-9"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                {/* Select Opcion 1 */}
                <div className="w-full sm:w-[150px]">
                  <Select value={option1} onValueChange={setOption1}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="opcion1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opcion1">opcion1</SelectItem>
                      <SelectItem value="opcion2">opcion2</SelectItem>
                      <SelectItem value="opcion3">opcion3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Opcion 1 (segundo) */}
                <div className="w-full sm:w-[150px]">
                  <Select value={option2} onValueChange={setOption2}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="opcion1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opcion1">opcion1</SelectItem>
                      <SelectItem value="opcion2">opcion2</SelectItem>
                      <SelectItem value="opcion3">opcion3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleDownloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </div>

            {/* Tabla de asistencia */}
            <DataTable<AttendanceRecord>
              columns={attendanceColumns}
              data={filteredAttendanceData}
              page={1}
              pageSize={10}
              onPageChange={() => {}}
              totalPages={1}
              rowIdKey="id"
            />
          </div>
        )}
      </div>

      {notification.isVisible && (
        <Notification
          title={notification.title}
          description={notification.description}
          onClose={hideNotification}
          autoCloseDuration={3000}
          variant={notification.title === "Error" ? "destructive" : "success"}
        />
      )}
    </div>
  );
}
