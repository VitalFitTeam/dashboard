"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

import { GymClass } from "./types";
import { classColors } from "@/styles/eventColors";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";

interface CalendarWrapperProps {
  onCreateClass?: (dateStr: string) => void;
  onViewClass?: (classId: string) => void;
}

interface Branch {
  branch_id: string;
  name: string;
}

interface Service {
  service_id: string;
  name: string;
}

interface Instructor {
  instructor_id: string;
  first_name: string;
  last_name: string;
}

export function ClassCalendar({
  onCreateClass,
  onViewClass,
}: CalendarWrapperProps) {
  const { user, hasRole, token } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<GymClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);

  // Cargar datos iniciales (branches, services, instructors)
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        return null;
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

          // Establecer la primera sucursal como filtro por defecto, o la del usuario si es branch_admin
          if (user?.role === "branch_admin" && user.branchId) {
            setBranchFilter(user.branchId);
          } else if (branchesResponse.data.length > 0) {
            setBranchFilter(branchesResponse.data[0].branch_id);
          }
        }

        // Cargar servicios para el filtro de tipos
        const servicesResponse = await api.products.getServices(token, {
          page: 1,
          limit: 100,
        });
        if (servicesResponse.data) {
          const servicesData = servicesResponse.data.map((service: any) => ({
            service_id: service.service_id,
            name: service.name,
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
            }),
          );
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token, user]);

  // Cargar clases cuando cambien los filtros
  useEffect(() => {
    const loadClasses = async () => {
      if (!token || !branchFilter) {
        return null;
      }

      try {
        setIsLoadingClasses(true);

        // Llamar a la API para obtener las clases de la sucursal seleccionada
        const response = await api.schedule.ListBranchesClass(
          branchFilter,
          token,
        );

        if (response.data) {
          // Convertir BranchClassInfo a GymClass para el calendario
          const calendarEvents: GymClass[] = response.data.map(
            (classInfo: any) => {
              const service = services.find(
                (s) => s.service_id === classInfo.service_id,
              );
              const instructor = instructors.find(
                (i) => i.instructor_id === classInfo.instructor_id,
              );
              const branch = branches.find(
                (b) => b.branch_id === classInfo.branch_id,
              );

              return {
                id: classInfo.class_id,
                title: service?.name || "Clase",
                start: classInfo.starts_at,
                end: classInfo.ends_at,
                type: service?.name || "General",
                instructorId: classInfo.instructor_id,
                instructorName: instructor
                  ? `${instructor.first_name} ${instructor.last_name}`
                  : "Instructor",
                maxCapacity: classInfo.max_capacity,
                branchId: classInfo.branch_id,
                branchName: branch?.name || "Sucursal",
                service_id: classInfo.service_id,
              };
            },
          );

          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error("Error cargando clases:", error);
        setEvents([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadClasses();
  }, [token, branchFilter, branches, services, instructors]);

  const visibleEvents = events.filter((e) => {
    if (!user) {
      return false;
    }

    let roleFilter = false;
    switch (user.role) {
      case "super_admin":
        roleFilter = true;
        break;
      case "branch_admin":
      case "recepcionist":
        roleFilter = e.branchId === user.branchId;
        break;
      case "instructor":
        roleFilter = e.instructorId === user.user_id;
        break;
      default:
        roleFilter = false;
    }

    return (
      roleFilter &&
      (!typeFilter || e.type === typeFilter) &&
      (!instructorFilter || e.instructorId === instructorFilter) &&
      (!branchFilter || e.branchId === branchFilter)
    );
  });

  const canCreate = () => {
    return hasRole?.(["super_admin", "branch_admin", "recepcionist"]) ?? false;
  };

  const handleDateClick = (arg: any) => {
    if (!canCreate()) {
      return;
    }

    if (onCreateClass) {
      onCreateClass(arg.dateStr);
    } else {
      router.push(
        `/classes/new?date=${arg.dateStr}&branch=${branchFilter || user?.branchId || "b-default"}`,
      );
    }
  };

  const handleEventClick = (info: any) => {
    const event = events.find((e) => e.id === info.event.id);
    if (!event) {
      return;
    }

    if (onViewClass) {
      onViewClass(event.id);
    } else {
      router.push(`/classes/${event.id}?branch=${event.branchId}`);
    }
  };

  // Indicador de carga principal
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        {/* Filtro por tipo de servicio */}
        <select
          className="border rounded px-2 py-1"
          value={typeFilter ?? ""}
          onChange={(e) => setTypeFilter(e.target.value || null)}
        >
          <option value="">Todos los tipos</option>
          {services.map((service) => (
            <option key={service.service_id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>

        {/* Filtro por instructor */}
        <select
          className="border rounded px-2 py-1"
          value={instructorFilter ?? ""}
          onChange={(e) => setInstructorFilter(e.target.value || null)}
        >
          <option value="">Todos los instructores</option>
          {instructors.map((instructor) => (
            <option
              key={instructor.instructor_id}
              value={instructor.instructor_id}
            >
              {instructor.first_name} {instructor.last_name}
            </option>
          ))}
        </select>

        {/* Filtro por sucursal */}
        <select
          className="border rounded px-2 py-1"
          value={branchFilter ?? ""}
          onChange={(e) => setBranchFilter(e.target.value || null)}
        >
          <option value="">Elija una sucursal</option>
          {branches.map((branch) => (
            <option key={branch.branch_id} value={branch.branch_id}>
              {branch.name}
            </option>
          ))}
        </select>

        {/* Indicador de carga para las clases */}
        {isLoadingClasses && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Cargando clases...</span>
          </div>
        )}
      </div>

      {/* Mensaje cuando no hay sucursal seleccionada */}
      {!branchFilter && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            Por favor, selecciona una sucursal para ver las clases disponibles.
          </p>
        </div>
      )}

      {/* Calendario */}
      <div className="relative">
        {isLoadingClasses && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando clases...</p>
            </div>
          </div>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="90vh"
          selectable={canCreate()}
          editable={false}
          displayEventTime={true}
          headerToolbar={{
            left: "dayGridMonth,timeGridWeek,timeGridDay",
            center: "title",
            right: "today prev,next",
          }}
          dayHeaderFormat={{ weekday: "short" }}
          events={visibleEvents}
          eventContent={(arg) => {
            const eventData = arg.event.extendedProps as GymClass;
            const color = classColors[eventData.type] ?? "#e2e8f0";

            const startTime = new Date(arg.event.start!).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const endTime = new Date(arg.event.end!).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                className="rounded-lg p-3 text-sm text-gray-900 hover:opacity-95 transition-opacity shadow-sm"
                style={{ backgroundColor: color }}
              >
                <div className="font-semibold text-base">{eventData.title}</div>
                <div className="text-gray-700">
                  {startTime} - {endTime}
                </div>
                <div className="text-gray-600">
                  Instructor: {eventData.instructorName}
                </div>
                <div className="text-gray-600">
                  Capacidad: {eventData.maxCapacity}
                </div>
                <div className="text-gray-600 text-xs">
                  Sucursal: {eventData.branchName}
                </div>
              </div>
            );
          }}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayCellDidMount={(info) => {
            const today = new Date();
            if (info.date.toDateString() === today.toDateString()) {
              info.el.style.backgroundColor = "#f3f4f6";
              info.el.style.borderRadius = "0.5rem";
            }
          }}
          loading={(isLoading) => {
            console.warn(isLoading);
          }}
        />
      </div>

      {!isLoadingClasses && branchFilter && visibleEvents.length === 0 && (
        <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded text-center">
          <p className="text-gray-600">
            No hay clases disponibles para la sucursal seleccionada.
          </p>
          {canCreate() && (
            <p className="text-gray-500 text-sm mt-2">
              Haz clic en una fecha para crear una nueva clase.
            </p>
          )}
        </div>
      )}
    </>
  );
}
