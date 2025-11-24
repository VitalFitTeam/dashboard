"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
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
  branch_id?: string;
}

export function ClassCalendar({
  onCreateClass,
  onViewClass,
}: CalendarWrapperProps) {
  const { user, hasRole, token } = useAuth();
  const router = useRouter();

  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<GymClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);

  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);

  // Instructores y servicios filtrados por sucursal seleccionada
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>(
    [],
  );
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Fecha actual por defecto
  const [currentView, setCurrentView] = useState<string>("dayGridMonth");
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
          setAllBranches(branchesResponse.data);

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
          setAllServices(servicesData);
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
              branch_id: instructor.branch_id, // Asegurar que tenemos branch_id
            }),
          );
          setAllInstructors(instructorsData);
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token, user]);

  // Filtrar instructores y servicios cuando cambie la sucursal seleccionada
  useEffect(() => {
    if (branchFilter) {
      // Método 1: Filtrar instructores por branch_id si está disponible
      let instructorsForBranch = allInstructors;

      // Si los instructores tienen branch_id, filtrar por él
      if (allInstructors.some((instructor) => instructor.branch_id)) {
        instructorsForBranch = allInstructors.filter(
          (instructor) => instructor.branch_id === branchFilter,
        );
      } else {
        // Método 2: Si no hay branch_id en instructores, obtener instructores de las clases de esta sucursal
        const instructorIdsFromEvents = Array.from(
          new Set(
            events
              .filter((event) => event.branchId === branchFilter)
              .map((event) => event.instructorId)
              .filter(Boolean),
          ),
        );

        instructorsForBranch = allInstructors.filter((instructor) =>
          instructorIdsFromEvents.includes(instructor.instructor_id),
        );
      }

      setFilteredInstructors(instructorsForBranch);

      // Resetear los otros filtros cuando cambia la sucursal
      setTypeFilter(null);
      setInstructorFilter(null);
    } else {
      setFilteredInstructors([]);
      setFilteredServices([]);
      setTypeFilter(null);
      setInstructorFilter(null);
    }
  }, [branchFilter, allInstructors, events]);

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
              const service = allServices.find(
                (s) => s.service_id === classInfo.service_id,
              );
              const instructor = allInstructors.find(
                (i) => i.instructor_id === classInfo.instructor_id,
              );
              const branch = allBranches.find(
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

          // Actualizar servicios filtrados basados en las clases reales de esta sucursal
          const servicesInBranch = Array.from(
            new Set(
              calendarEvents
                .map((event) => event.service_id)
                .filter(Boolean) as string[],
            ),
          )
            .map((serviceId) =>
              allServices.find((service) => service.service_id === serviceId),
            )
            .filter(Boolean) as Service[];

          setFilteredServices(servicesInBranch);

          // Actualizar instructores filtrados basados en las clases reales de esta sucursal
          const instructorsInBranch = Array.from(
            new Set(
              calendarEvents
                .map((event) => event.instructorId)
                .filter(Boolean) as string[],
            ),
          )
            .map((instructorId) =>
              allInstructors.find(
                (instructor) => instructor.instructor_id === instructorId,
              ),
            )
            .filter(Boolean) as Instructor[];

          // Si no hay branch_id en los instructores, usar los instructores de las clases
          if (!allInstructors.some((instructor) => instructor.branch_id)) {
            setFilteredInstructors(instructorsInBranch);
          }
        }
      } catch (error) {
        console.error("Error cargando clases:", error);
        setEvents([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadClasses();
  }, [token, branchFilter, allBranches, allServices, allInstructors]);

  // Ir al mes actual cuando se carga el componente
  useEffect(() => {
    if (calendarRef.current && !isLoading) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(new Date()); // Ir a la fecha actual
    }
  }, [isLoading]);

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
        `/calendar/new?date=${arg.dateStr}&branch=${branchFilter || user?.branchId || "b-default"}`,
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
      router.push(`/calendar/${event.id}?branch=${event.branchId}`);
    }
  };

  // Manejar cambio de sucursal
  const handleBranchChange = (branchId: string) => {
    setBranchFilter(branchId || null);
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
      {/* (Los filtros se muestran dentro de la toolbar cuando se activa "Filtro") */}

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
        <div className="container-toolbar">
          {/* Toolbar personalizado con botón Filtro */}
          <div className="mb-3">
            <div className="flex items-center justify-between border-b-2 pb-2">
              <div className="flex items-center gap-4">
                <span className="text-orange-400 font-semibold">Calendar</span>
                <div className="flex gap-2 items-center">
                  <button
                    className={`px-3 py-1 text-sm border-0 ${currentView === "dayGridMonth"
                        ? "text-orange-400 border-b-2 border-orange-400"
                        : "bg-transparent"
                      }`}
                    onClick={() => {
                      calendarRef.current?.getApi?.()?.changeView("dayGridMonth");
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-3 py-1 text-sm border-0 ${currentView === "timeGridWeek"
                        ? "text-orange-400 border-b-2 border-orange-400"
                        : "bg-transparent"
                      }`}
                    onClick={() => {
                      calendarRef.current?.getApi?.()?.changeView("timeGridWeek");
                    }}
                  >
                    Weekly
                  </button>
                  <button
                    className={`px-3 py-1 text-sm border-0 ${currentView === "timeGridDay"
                        ? "text-orange-400 border-b-2 border-orange-400"
                        : "bg-transparent"
                      }`}
                    onClick={() => {
                      calendarRef.current?.getApi?.()?.changeView("timeGridDay");
                    }}
                  >
                    Daily
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                {/* filtro en la misma linea pero al final derecho */}
                <div className="self-end">
                  <button
                    className="ml-2 px-3 py-1 rounded text-sm border border-orange-400 flex items-center gap-2 text-orange-400"
                    onClick={() => setShowFilters((s) => !s)}
                    aria-pressed={showFilters}
                  >
                    <FunnelIcon className="h-4 w-4" />
                    Filtro
                  </button>
                </div>

              </div>
            </div>

            {/* Filtros desplegables (muestran los selects existentes) */}
            {showFilters && (
              <div className="mt-3 flex gap-3 flex-wrap items-center">
                <select
                  className="border rounded px-2 py-1 min-w-[150px]"
                  value={branchFilter ?? ""}
                  onChange={(e) => handleBranchChange(e.target.value)}
                >
                  <option value="">Elija una sucursal</option>
                  {allBranches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                {branchFilter && (
                  <select
                    className="border rounded px-2 py-1 min-w-[150px]"
                    value={typeFilter ?? ""}
                    onChange={(e) => setTypeFilter(e.target.value || null)}
                  >
                    <option value="">Todos los servicios</option>
                    {filteredServices.map((service) => (
                      <option key={service.service_id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                )}

                {branchFilter && (
                  <select
                    className="border rounded px-2 py-1 min-w-[150px]"
                    value={instructorFilter ?? ""}
                    onChange={(e) => setInstructorFilter(e.target.value || null)}
                  >
                    <option value="">Todos los instructores</option>
                    {filteredInstructors.map((instructor) => (
                      <option
                        key={instructor.instructor_id}
                        value={instructor.instructor_id}
                      >
                        {instructor.first_name} {instructor.last_name}
                      </option>
                    ))}
                  </select>
                )}

                {isLoadingClasses && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Cargando clases...</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-4 mt-2">
              <div className="flex items-center mt-2">
                <div className="text-lg text-orange-400 font-semibold">
                  {currentDate.toLocaleString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100"
                  onClick={() => {
                    try {
                      const api = calendarRef.current?.getApi?.();
                      const current = api.getDate();
                      const yearInput = window.prompt(
                        "Ir a año:",
                        String(current.getFullYear()),
                      );
                      if (!yearInput){return;}
                      const y = parseInt(yearInput, 10);
                      if (isNaN(y)){return;}
                      api.gotoDate(new Date(y, current.getMonth(), 1));
                    } catch (e) {
                      console.error("Error al cambiar de año:", e);
                    }
                  }}
                  aria-label="Cambiar año"
                >
                  <ChevronDownIcon className="h-5 w-5 text-orange-400" />
                </button>
              </div>
              <div className="flex gap-2 items-center mt-2">
                <button
                  className="p-2 rounded bg-orange-100"
                  onClick={() => calendarRef.current?.getApi?.()?.prev()}
                  aria-label="Anterior"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  className="px-3 py-1 rounded border bg-orange-400 text-white"
                  onClick={() => {
                    const today = new Date();
                    calendarRef.current?.getApi?.()?.today();
                    setCurrentDate(today);
                  }}
                >
                  Hoy
                </button>
                <button
                  className="p-2 rounded bg-orange-100"
                  onClick={() => calendarRef.current?.getApi?.()?.next()}
                  aria-label="Siguiente"
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-700" />
                </button>
              </div>

            </div>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={new Date()} // Fecha inicial establecida como hoy
            height="90vh"
            selectable={canCreate()}
            editable={false}
            displayEventTime={true}
            headerToolbar={false}
            datesSet={(arg) => {
              setCurrentDate(arg.start ?? new Date());
              setCurrentView(arg.view.type);
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
                  className="rounded-lg text-xs text-gray-900 hover:opacity-95 transition-opacity shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <div className="font-semibold text-sm">{eventData.title}</div>
                  <div className="text-gray-700">
                    {startTime} - {endTime}
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