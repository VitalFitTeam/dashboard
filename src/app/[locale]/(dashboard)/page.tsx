"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { StatCard } from "@/components/ui/StatCard";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTopBranches, useTotalActiveBranches, useTotalClients } from "@/hooks/useReports";
import { BuildingOffice2Icon } from "@heroicons/react/24/solid";
import { FranchisePerformanceItem } from "@/components/modules/analytics/FranchisePerformanceItem";

export default function SuperAdminDashboard() {
    const { token } = useAuth();
    const t = useTranslations("dashboards.super_admin");

    const { data: totalActiveBranch, isLoading: isLoadingBranches } = useTotalActiveBranches(token);
    const { data: topActiveBranch, isLoading: isLoadingTopBranches } = useTopBranches(token);
    const { data: totalClients, isLoading: isLoadingClients } = useTotalClients(token);

    const normalizeTrend = (value?: string) =>
        value?.toLowerCase() === "up" || value?.toLowerCase() === "down"
            ? (value.toLowerCase() as "up" | "down")
            : undefined;

    const systemAlerts = [
        {
            color: "text-yellow-600",
            title: t("alerts.items.low_occupancy"),
            desc: "Querétaro - Clases < 30%",
            time: "2h",
        },
        {
            color: "text-red-600",
            title: t("alerts.items.pending_finance"),
            desc: "Cancún - Cierre Mes",
            time: "5h",
        },
        {
            color: "text-blue-600",
            title: t("alerts.items.new_franchisee"),
            desc: "Onboarding initiated",
            time: "1d",
        },
        {
            color: "text-blue-600",
            title: t("alerts.items.sync_error"),
            desc: "API de pagos",
            time: "1d",
        },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={t("stats.global_sales")}
                        value={<h3 className="ml-1.5 font-normal">$ 1,250,000</h3>}
                        icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                        description={<span className="text-green-600">{t("stats.vs_last_month", { value: "+20.1%" })}</span>}
                    />

                    <StatCard
                        title={t("stats.active_branches")}
                        value={isLoadingBranches ? "-" : totalActiveBranch}
                        icon={<BuildingOffice2Icon className="h-5 w-5 text-gray-500" />}
                    />

                    <StatCard
                        title={t("stats.total_clients")}
                        value={isLoadingClients ? "-" : totalClients}
                        icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                    />

                    <StatCard
                        title={t("stats.global_nps")}
                        value={<h3 className="ml-1.5 font-normal">8.63</h3>}
                        icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                        description={<span className="text-red-600">{t("stats.vs_last_month", { value: "-1.2%" })}</span>}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                {t("performance.title")}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                {t("performance.subtitle", { count: isLoadingTopBranches ? "-" : topActiveBranch?.length ?? 0 })}
                            </p>
                        </CardHeader>

                        <CardContent>
                            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                                {topActiveBranch?.map((branch, index) => (
                                    <FranchisePerformanceItem
                                        key={branch.label}
                                        name={branch.label}
                                        status={branch.status}
                                        revenue={branch.value}
                                        growth={branch.percent_change}
                                        trend={normalizeTrend(branch.trend)}
                                        withBorder={index !== topActiveBranch.length - 1}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                {t("alerts.title")}
                            </CardTitle>
                            <p className="text-sm text-gray-500">{t("alerts.subtitle")}</p>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {systemAlerts.map((alert, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <AlertTriangle className={`h-5 w-5 ${alert.color} mt-0.5`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{alert.title}</p>
                                            <p className="text-xs text-gray-600">{alert.desc}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{alert.time}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}