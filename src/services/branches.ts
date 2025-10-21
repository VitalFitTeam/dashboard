import { fetchAPI } from "@/lib/api";

export interface ApiBranch {
  branch_id: string;
  country_name: string;
  manager_name: string;
  manager_last_name: string;
  name: string;
  state_name: string;
  status: string;
  tax_id: string;
}

export type BranchesTableRow = {
  id: string;
  name: string;
  taxId: string;
  administrator: string;
  state: string;
  country: string;
  status: "Active" | "Inactive" | "Maintenance";
};

export type BranchesFetchResult = {
  data: BranchesTableRow[];
  total: number;
};

interface ApiBranchesResponse {
  data: ApiBranch[];
  total?: number;
}

interface FetchBranchesParams {
  limit: number;
  offset: number;
  sort: "asc" | "desc";
  search?: string;
  status?: string;
  token: string | null;
}

export async function fetchBranches({
  limit,
  offset,
  sort,
  search,
  status,
  token,
}: FetchBranchesParams): Promise<BranchesFetchResult> {
  const query = new URLSearchParams();
  query.append("limit", limit.toString());
  query.append("offset", offset.toString());
  query.append("sort", sort);

  if (search) {
    query.append("search", search);
  }
  if (status) {
    query.append("status", status);
  }

  const res: ApiBranchesResponse = await fetchAPI(
    `/user/branch-admins?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.data) {
    console.error("Respuesta de API inválida, falta 'data'");
    return { data: [], total: 0 };
  }

  const mappedData: BranchesTableRow[] = res.data.map((b) => ({
    id: b.branch_id,
    name: b.name,
    taxId: b.tax_id,
    administrator: `${b.manager_name} ${b.manager_last_name}`,
    state: b.state_name,
    country: b.country_name,
    status: b.status as "Active" | "Inactive" | "Maintenance",
  }));

  const total =
    res.total ??
    offset + mappedData.length + (mappedData.length === limit ? 1 : 0);

  return {
    data: mappedData,
    total: total,
  };
}
