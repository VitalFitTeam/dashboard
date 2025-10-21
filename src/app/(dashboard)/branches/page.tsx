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
import { Branches } from "@/types/branches";
import { Instructor } from "@/types/instructor";
import { City, State } from "@/types/location";
import { Service } from "@/types/service";
import { Equipment } from "@/types/equipment";
import { PaymentMethod } from "@/types/paymentMethod";

const MOCK_BRANCHES: Branches[] = [
  {
    id: "1",
    name: "Sucursal Centro",
    taxId: "J-123456",
    city: "Caracas",
    country: "Venezuela",
    status: "active",
    cityId: "c1",
    paymethods: [],
    operatingHours: [],
    // Campos añadidos para coincidir con el tipo 'Branches'
    instructors: [],
    services: [],
    inventory: [],
  },
  {
    id: "2",
    name: "Sucursal Este",
    taxId: "J-654321",
    city: "Barquisimeto",
    country: "Venezuela",
    status: "inactive",
    cityId: "c2",
    paymethods: [],
    operatingHours: [],
    // Campos añadidos para coincidir con el tipo 'Branches'
    instructors: [],
    services: [],
    inventory: [],
  },
];
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
const MOCK_STATS = { total: 2, active: 1, inactive: 1, maintenance: 0 };

const statCardsConfig = [
  { title: "Total", valueKey: "total" as keyof typeof MOCK_STATS },
  { title: "Activas", valueKey: "active" as keyof typeof MOCK_STATS },
  { title: "Inactivas", valueKey: "inactive" as keyof typeof MOCK_STATS },
  {
    title: "Mantenimiento",
    valueKey: "maintenance" as keyof typeof MOCK_STATS,
  },
];

export type PaymentMethodUI = PaymentMethod & {
  icon?: React.ElementType;
};

const MOCK_API_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_cash",
    name: "Efectivo",
    type: "Cash",
    description: "Pago en efectivo",
  },
  {
    id: "pm_card",
    name: "Tarjeta Credito/Debito",
    type: "Card",
    description: "Visa/Mastercard",
  },
  {
    id: "pm_transfer",
    name: "Transferencia Bancaria",
    type: "Transfer",
    description: "Directa a cuenta",
  },
  {
    id: "pm_mobile",
    name: "Pago Movil",
    type: "Mobile",
    description: "Interbancario",
  },
];

function mapApiPaymentMethodsToUI(methods: PaymentMethod[]): PaymentMethodUI[] {
  // <-- Use PaymentMethod here
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

  const [statsData, setStatsData] = useState(MOCK_STATS);
  const [branchesData, setBranchesData] = useState<Branches[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allStates, setAllStates] = useState<State[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethodUI[]>(
    [],
  );

  useEffect(() => {
    async function loadPageData() {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setBranchesData(MOCK_BRANCHES);
        setAllInstructors(MOCK_INSTRUCTORS);
        setAllCities(MOCK_CITIES);
        setAllStates(MOCK_STATES);
        setAllServices(MOCK_SERVICES);
        setAllEquipment(MOCK_EQUIPMENT);
        setStatsData(MOCK_STATS);
        const uiPaymentMethods = mapApiPaymentMethodsToUI(
          MOCK_API_PAYMENT_METHODS,
        );
        setAllPaymentMethods(uiPaymentMethods);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPageData();
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
        isLoading={isLoading}
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
          <BranchFrom onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
