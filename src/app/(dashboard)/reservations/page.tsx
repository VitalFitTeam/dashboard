"use client";
import { ClassCard } from "./ClassCard";
import { classesData } from "./data";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";

export default function Reservations() {
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState(classesData);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const handleFilter = () => {
    const text = searchInput.trim().toLowerCase();

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = classesData.filter((classData) => {
      // texto
      const matchesText = text === "" || classData.title.toLowerCase().includes(text);

      // rango de fechas: usamos dateISO si existe
      let matchesDate = true;
      if ((from || to) && classData.dateISO) {
        const classDate = new Date(classData.dateISO);
        if (from && classDate < from){matchesDate = false;}
        if (to && classDate > to){matchesDate = false;}
      } else if ((from || to) && !classData.dateISO) {
        // si se ha establecido un filtro por fecha pero la clase no tiene dateISO, la excluimos
        matchesDate = false;
      }

      return matchesText && matchesDate;
    });

    setFilteredData(filtered);

    // marcar si hay filtros aplicados (texto o rango de fechas)
    setFiltersApplied(text !== "" || Boolean(fromDate) || Boolean(toDate));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFromDate("");
    setToDate("");
    setFilteredData(classesData);
    setFiltersApplied(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Clases" value={classesData.length} />
          <StatCard
            title="Reservas Totales"
            value={classesData.reduce((acc, c) => acc + c.confirmedReservations.length, 0)}
          />
          <StatCard
            title="Cupos Disponibles"
            value={<><span className="text-green-400">{classesData.reduce((acc, c) => acc + Math.max(0, c.capacity - c.enrolled), 0)}</span></>}
          />
          <StatCard
            title="Ocupación Promedio"
            value={<><span className="text-red-400">{(
              (classesData.reduce((acc, c) => acc + (c.capacity ? (c.enrolled / c.capacity) : 0), 0) /
                classesData.length) *
              100
            ).toFixed(1)}%</span></>}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          RESERVAS POR BLOQUE
        </h1>
        <p className="mb-6">Encuentra todos los clientes reservados por clase</p>
        <div className="filters my-4 flex items-center gap-4">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por clase o instructor"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center ml-auto">
            {filtersApplied ? (
              <Button onClick={clearFilters}>Borrar filtros</Button>
            ) : (
              <Button
                className="border border-orange-400 text-orange-400"
                variant="outline"
                onClick={handleFilter}
              >
                <FunnelIcon className="w-6 h-6" />
                Filtrar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((classData) => (
                <ClassCard
                  key={classData.classId}
                  classId={classData.classId}
                  title={classData.title}
                  date={classData.date}
                  enrolled={classData.enrolled}
                  capacity={classData.capacity}
                  status={classData.status}
                  confirmedReservations={classData.confirmedReservations}
                  waitingList={classData.waitingList}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se encontraron clases que coincidan con "{searchInput}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}