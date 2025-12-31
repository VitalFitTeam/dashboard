import { StatCard } from "@/components/ui/StatCard";
import { useFinanceReports } from "@/hooks/reports/useFinanceReports";
import { DollarSign, TrendingUp, Ticket, Users } from "lucide-react";

interface StatProps {
  token: string | null;
}

export function WeeklyRevenueStat({ token }: StatProps) {
  const { data, isLoading } = useFinanceReports.useWeeklyRevenue(token);

  return (
    <StatCard 
      title="Ingresos Semanales"
      value={data?.value || "$0"}
      isLoading={isLoading}
      icon={<DollarSign className="h-5 w-5 text-gray-400" />}
      trend={{ 
        value: data?.trend_percent || 0, 
        isPositive: data?.is_positive, 
        label: data?.trend_label 
      }}
    />
  );
}

export function MRRStat({ token }: StatProps) {
  const { data, isLoading } = useFinanceReports.useMRR(token);

  return (
    <StatCard 
      title="MRR (Mensual)"
      value={data?.value || "$0"}
      isLoading={isLoading}
      icon={<TrendingUp className="h-5 w-5 text-gray-400" />}
      trend={{ 
        value: data?.trend_percent || 0, 
        isPositive: data?.is_positive, 
        label: data?.trend_label 
      }}
    />
  );
}

export function AverageTicketStat({ token }: StatProps) {
  const { data, isLoading } = useFinanceReports.useAverageTicket(token);

  return (
    <StatCard 
      title="Ticket Promedio"
      value={data?.value || "$0"}
      isLoading={isLoading}
      icon={<Ticket className="h-5 w-5 text-gray-400" />}
      trend={{ 
        value: data?.trend_percent || 0, 
        isPositive: data?.is_positive, 
        label: data?.trend_label 
      }}
    />
  );
}

export function CLVStat({ token }: StatProps) {
  const { data, isLoading } = useFinanceReports.useCLV(token);

  return (
    <StatCard 
      title="LTV (Valor Cliente)"
      value={data?.value || "$0"}
      isLoading={isLoading}
      icon={<Users className="h-5 w-5 text-gray-400" />}
      trend={{ 
        value: data?.trend_percent || 0, 
        isPositive: data?.is_positive, 
        label: data?.trend_label 
      }}
    />
  );
}