import { api } from "@/lib/sdk-config";
import { useReportBase } from "../reports/useReportBase";
import { BranchClassInfo } from "@vitalfit/sdk";

export function useBranchesClass(branchID: string, jwt: string) {
  const key = branchID && jwt ? ["branches-schedule", branchID, jwt] : null;

  const fetcher = () => api.schedule.ListBranchesClass(branchID, jwt);

  return useReportBase<BranchClassInfo[]>(key, fetcher);
}