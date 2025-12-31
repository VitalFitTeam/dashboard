// hooks/reports/useFinanceReports.ts
import { api } from "@/lib/sdk-config";
import { useReportBase } from "./useReportBase";
import { KPICard, ChartData, BillingMatrix } from "@vitalfit/sdk";

export const useFinanceReports = {

  useMRR: (jwt: string | null, branchId?: string) =>
    useReportBase<KPICard>(
      jwt ? ["finance", "mrr", jwt, branchId] : null,
      () => {
        if (!jwt) {
            throw new Error("No JWT provided");
        }
        return api.report.monthlyRecurringRevenueKPI(jwt, branchId);
      }
    ),

  useAccountsReceivable: (jwt: string | null, branchId?: string) =>
    useReportBase<KPICard>(
      jwt ? ["finance", "accountsReceivable", jwt, branchId] : null,
      () => {
        if (!jwt) {
            throw new Error("No JWT provided");
        }
        return api.report.accountsReceivableKPI(jwt, branchId);
      }
    ),

  useAverageTicket: (jwt: string | null, branchId?: string) =>
    useReportBase<KPICard>(
      jwt ? ["finance", "averageTicket", jwt, branchId] : null,
      () => {
        if (!jwt){
             throw new Error("No JWT provided");
        }
        return api.report.averageTicketKPI(jwt, branchId);
      }
    ),

  useWeeklyRevenue: (jwt: string | null, branchId?: string) =>
    useReportBase<KPICard>(
      jwt ? ["finance", "weeklyRevenue", jwt, branchId] : null,
      () => {
        if (!jwt){
             throw new Error("No JWT provided");
        }
        return api.report.weeklyRevenueKPI(jwt, branchId);
      }
    ),

  useCLV: (jwt: string | null, branchId?: string) =>
    useReportBase<KPICard>(
      jwt ? ["finance", "clv", jwt, branchId] : null,
      () => {
        if (!jwt) {
            throw new Error("No JWT provided");
        }
        return api.report.averageCLVKPI(jwt, branchId);
      }
    ),

  useTotalTransactions: (jwt: string | null, branchId?: string) =>
    useReportBase<KPICard>(
      jwt ? ["finance", "totalTransactions", jwt, branchId] : null,
      () => {
        if (!jwt) {
            throw new Error("No JWT provided");
        }
        return api.report.totalTransactionsKPI(jwt, branchId);
      }
    ),


  useMonthlyCashFlow: (jwt: string | null, branchId?: string) =>
    useReportBase<ChartData[]>(
      jwt ? ["finance", "cashFlowChart", jwt, branchId] : null,
      () => {
        if (!jwt) {
            throw new Error("No JWT provided");
        }
        return api.report.monthlyCashFlowChart(jwt, branchId);
      }
    ),

  useMonthlyRevenueChart: (jwt: string | null, branchId?: string) =>
    useReportBase<ChartData[]>(
      jwt ? ["finance", "revenueChart", jwt, branchId] : null,
      () => {
        if (!jwt){
             throw new Error("No JWT provided");
        }
        return api.report.monthlyRevenueChart(jwt, branchId);
      }
    ),

    useBillingMatrix: (jwt: string | null, branchId?: string) =>
    useReportBase<ChartData[]>(
      jwt ? ["finance", "billingMatrix", jwt, branchId] : null,
      () => {
        if (!jwt){
             throw new Error("No JWT provided");
        }
        return api.report.billingByBranchMatrix(jwt, branchId);
      }
    )
};