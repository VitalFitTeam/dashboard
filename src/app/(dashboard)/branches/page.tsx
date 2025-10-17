import { StatCard } from "@/components/StatCard";
import BranchesTable from "./BranchesTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

const statsData = {
  total: 100,
  active: 70,
  inactive: 20,
  maintenance: 10,
};

const statCardsConfig = [
  {
    title: "Total",
    valueKey: "total" as keyof typeof statsData,
  },
  {
    title: "Activas",
    valueKey: "active" as keyof typeof statsData,
  },
  {
    title: "Inactivas",
    valueKey: "inactive" as keyof typeof statsData,
  },
  {
    title: "Mantenimiento",
    valueKey: "maintenance" as keyof typeof statsData,
  },
];

export default function HomeBranches() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="SUCURSALES">
        <Button variant="primary">
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

      <BranchesTable />
    </div>
  );
}
