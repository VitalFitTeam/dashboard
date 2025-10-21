"use client";
import { StatCard } from "@/components/StatCard";
import BranchesTable from "./BranchesTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import BranchFrom from "./BranchForm";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Instructor } from "@/types/instructor";
import { City, State, Country } from "@/types/location";
import { Service } from "@/types/service";
import { Equipment } from "@/types/equipment";
import { PaymentMethod } from "@/types/paymentMethod";
import {
  BranchesFetchResult,
  BranchesTableRow,
  fetchBranches,
} from "@/services/branches";
import { fetchPaymentMethods } from "@/services/paymentMethods";

const MOCK_INSTRUCTORS: Instructor[] = [
  { id: "i1", user_id: "u1", name: "Ana Pérez" },
  { id: "i2", user_id: "u2", name: "Carlos Rivas" },
];
const MOCK_CITIES: City[] = [
  { id: "c1", name: "Caracas", stateId: "s1" },
  { id: "c2", name: "Barquisimeto", stateId: "s2" },
];
const MOCK_STATES: State[] = [
  { id: "s1", name: "Distrito Capital", countryId: "co1" },
  { id: "s2", name: "Lara", countryId: "co1" },
];
const MOCK_SERVICES: Service[] = [
  { id: "srv1", name: "Yoga", categoryId: "cat1" },
  { id: "srv2", name: "Pesas", categoryId: "cat1" },
];
const MOCK_EQUIPMENT: Equipment[] = [
  { id: "eq1", name: "Cinta de correr", category: "Cardio" },
];
const statCardsConfig: { title: string; valueKey: keyof StatsData }[] = [
  { title: "Total", valueKey: "total" },
  { title: "Activas", valueKey: "active" },
  { title: "Inactivas", valueKey: "inactive" },
  { title: "Mantenimiento", valueKey: "maintenance" },
];

type StatsData = {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
};

export type PaymentMethodUI = PaymentMethod & {
  icon?: React.ElementType;
};

const MOCK_COUNTRIES: Country[] = [{ id: "co1", name: "Venezuela" }];

function mapApiPaymentMethodsToUI(methods: PaymentMethod[]): PaymentMethodUI[] {
  return methods.map((method) => {
    let IconComponent: React.ElementType | undefined;
    switch (method.type.toLowerCase()) {
      case "cash":
        IconComponent = BanknotesIcon;
        break;
      case "card":
        IconComponent = CreditCardIcon;
        break;
      case "transfer":
        IconComponent = BuildingLibraryIcon;
        break;
      case "mobile":
        IconComponent = DevicePhoneMobileIcon;
        break;
    }
    return { ...method, icon: IconComponent };
  });
}

export default function HomeBranches() {
  const [showModal, setShowModal] = useState(false);
  const [isLoadingStatic, setIsLoadingStatic] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
  });
  const [branchesData, setBranchesData] = useState<BranchesTableRow[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [allStates, setAllStates] = useState<State[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethodUI[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [totalBranches, setTotalBranches] = useState(0);

  useEffect(() => {
    async function loadStaticData() {
      setIsLoadingStatic(true);
      try {
        setStatsData({ total: 25, active: 15, inactive: 8, maintenance: 2 });

        const paymentMethodsData = await fetchPaymentMethods();
        console.log("MÉTODOS DE PAGO RECIBIDOS:", paymentMethodsData);
        const uiPaymentMethods = mapApiPaymentMethodsToUI(paymentMethodsData);

        setAllPaymentMethods(uiPaymentMethods);

        setAllCities(MOCK_CITIES);
        setAllStates(MOCK_STATES);
        setAllServices(MOCK_SERVICES);
        setAllEquipment(MOCK_EQUIPMENT);
      } catch (error) {
        console.error("Error cargando datos estáticos:", error);
      } finally {
        setIsLoadingStatic(false);
      }
    }
    loadStaticData();
  }, []);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="SUCURSALES">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <PlusIcon className="h-5 w-5" />
          Crear Sucursal
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={
              <>
                {statsData[card.valueKey]}
                <span className="ml-1.5 text-base font-normal">SUCURSALES</span>
              </>
            }
          />
        ))}
      </div>
      <BranchesTable
        data={branchesData}
        isLoading={isLoadingBranches}
        page={page}
        pageSize={pageSize}
        totalCount={totalBranches}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        allInstructors={allInstructors}
        allCities={allCities}
        allStates={allStates}
        allServices={allServices}
        allEquipment={allEquipment}
        allPaymentMethods={allPaymentMethods}
      />

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <BranchFrom
            onClose={() => setShowModal(false)}
            onClick={(e) => e.stopPropagation()}
            allPaymentMethods={allPaymentMethods}
          />
        </div>
      )}
    </div>
  );
}
