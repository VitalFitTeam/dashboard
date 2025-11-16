"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import ClassForm from "../ClassesForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { ClassFormData, ClassFormSchema } from "@/lib/validation/class";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Input } from "@/components/ui/Input";
import { Download } from "lucide-react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceRecord {
  id: string;
  userName: string;
  className: string;
  checkInTime: string;
  status: "Presente" | "Ausente" | "Tardío";
}

export default function ClassDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "attendance">("info");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClassFormData, string>>
  >({});

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");

  const classId = params.id as string;

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

  if (!token) {
    return null;
  }

  const validateForm = (): boolean => {
    const result = ClassFormSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof ClassFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as keyof ClassFormData] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateField = (field: keyof ClassFormData): boolean => {
    const fieldSchema = ClassFormSchema.pick({ [field]: true });
    const result = fieldSchema.safeParse({ [field]: formData[field] });

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || "Error de validación";
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof ClassFormData]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof ClassFormData]: undefined,
      }));
    }
  };

  const handleBlur = (field: string) => {
    validateField(field as keyof ClassFormData);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setNotification({
        isVisible: true,
        description: "Por favor corrige los errores en el formulario",
        title: "Error de validación",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const DEFAULT_BRANCH_ID = "main-branch";

      const updateData = {
        service_id: formData.service_id,
        instructor_id: formData.instructor_id,
        max_capacity: parseInt(formData.max_capacity),
        starts_at: new Date(
          `${formData.start_date}T${formData.start_time}`,
        ).toISOString(),
        ends_at: new Date(
          `${formData.end_date}T${formData.end_time}`,
        ).toISOString(),
        is_visible: true,
        notes: "",
      };

      await api.schedule.UpdateClass(
        DEFAULT_BRANCH_ID,
        classId,
        updateData,
        token,
      );

      setNotification({
        isVisible: true,
        description: "Clase actualizada exitosamente",
        title: "Éxito",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error actualizando clase:", error);
      setNotification({
        isVisible: true,
        description: "Error al actualizar la clase",
        title: "Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const handleDownloadCSV = () => {
    // Lógica para descargar CSV
    console.log("Descargando CSV...");
  };

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
        {activeTab === "info" && isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        ) : activeTab === "info" ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Modificar
          </Button>
        ) : (
          <></>
        )}
      </PageHeader>

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
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
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
