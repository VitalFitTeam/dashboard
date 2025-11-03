"use client";
import BranchesTable from "./BranchesTable";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/sdk-config";
import {
  PaginatedBranch,
  BranchStatusCount,
  Pagination,
  PaymentMethod,
  User,
} from "@vitalfit/sdk";
import BranchFrom from "./BranchForm";
import { redirect } from "next/navigation";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Instructor } from "@/models/instructor";
import { City, State, Country } from "@/models/location";
import { Service } from "@/models/service";
import { Equipment } from "@/models/equipment";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { useAuth } from "@/context/AuthContext";

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
const statCardsConfig: {
  title: string;
  valueKey: keyof BranchStatusCount | "Total";
}[] = [
  { title: "Total", valueKey: "Total" },
  { title: "Activas", valueKey: "Active" },
  { title: "Inactivas", valueKey: "Inactive" },
  { title: "Mantenimiento", valueKey: "Maintenance" },
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
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingStatic, setIsLoadingStatic] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [statsData, setStatsData] = useState<BranchStatusCount>({
    Active: 0,
    Inactive: 0,
    Maintenance: 0,
    Total: 0,
  });
  const [branchesData, setBranchesData] = useState<PaginatedBranch[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [allStates, setAllStates] = useState<State[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethodUI[]>(
    [],
  );
  const [allBranchAdmins, setAllBranchAdmins] = useState<User[]>();
  const [filters, setFilters] = useState<Record<string, string | undefined>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [totalBranches, setTotalBranches] = useState(0);
  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalBranches / pageSize)) : 1;

  const handleFilterChange = (key: string, value: string | undefined) => {
    setPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setShowSuccessAlert(true);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    async function loadStaticData() {
      setIsLoadingStatic(true);
      try {
        const [paymentMethodsData, branchAdminsData] = await Promise.all([
          api.paymentMethod.getPaymentMethods(token || ""),
          api.user.getBranchAdmins(token || ""),
        ]);

        const uiPaymentMethods = mapApiPaymentMethodsToUI(
          paymentMethodsData.data,
        );
        setAllPaymentMethods(uiPaymentMethods);
        setAllBranchAdmins(branchAdminsData.data);
        setAllInstructors(MOCK_INSTRUCTORS);
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

  useEffect(() => {
    async function loadBranchesData() {
      setIsLoadingBranches(true);
      try {
        const searchTerms = filters.name || filters.tax_id;
        const statusFilter = filters.status;

        const branchesResult: Pagination<PaginatedBranch[]> =
          await api.branch.getBranches(
            {
              limit: pageSize,
              page,
              sort,
              search: searchTerms,
              status: statusFilter,
            },
            token || "",
          );
        setBranchesData(branchesResult.data);

        api.branch.getBranchStatusCount(token || "").then((data) => {
          setStatsData(data.data);
          const hasActiveFilters = Object.values(filters).some((f) => f);
          const total = hasActiveFilters
            ? branchesResult.count
            : data.data.Total;
          setTotalBranches(total);
        });
      } catch (error) {
        console.error("Error cargando sucursales:", error);
      } finally {
        setIsLoadingBranches(false);
      }
    }
    loadBranchesData();
  }, [page, pageSize, sort, filters, refreshKey, token]);

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
                {card.valueKey === "Total"
                  ? statsData.Active +
                    statsData.Inactive +
                    statsData.Maintenance
                  : (statsData[card.valueKey] ?? 0)}
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
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        allInstructors={allInstructors}
        allServices={allServices}
        allEquipment={allEquipment}
        allPaymentMethods={allPaymentMethods}
        onFilterChange={handleFilterChange}
        onBranchDeleted={() => setRefreshKey((prev) => prev + 1)}
        filterValues={filters}
      />

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <BranchFrom
            onClose={() => setShowModal(false)}
            allPaymentMethods={allPaymentMethods}
            allCountries={allCountries}
            allStates={allStates}
            allCities={allCities}
            allBranchAdmins={allBranchAdmins || []}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      <GeneralAlertDialog
        open={showSuccessAlert}
        onOpenChange={setShowSuccessAlert}
        trigger={<span />}
        type="info"
        title="¡Sucursal Creada!"
        description="La nueva sucursal ha sido guardada exitosamente."
        actionText="Continuar"
      />
    </div>
  );
}
