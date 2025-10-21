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
  status: "active" | "inactive" | "maintenance";
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
}

export async function fetchBranches({
  limit,
  offset,
  sort,
  search,
  status,
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
    `/branches?${query.toString()}`,
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
    status: b.status as "active" | "inactive" | "maintenance",
  }));

  const total =
    res.total ??
    offset + mappedData.length + (mappedData.length === limit ? 1 : 0);

  return {
    data: mappedData,
    total: total,
  };
}

export type CreateBranchPayload = {
  address?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  manager_id?: string | null;
  max_capacity?: number | null;
  name?: string | null;
  operating_hours?: Array<{
    close_time?: string | null;
    day_of_week?: string | null;
    is_closed?: boolean;
    open_time?: string | null;
  }>;
  payment_methods?: string[] | null;
  phone?: string | null;
  state?: string | null;
  status?: string | null; // e.g. 'Active'
  tax_id?: string | null;
};

export async function createBranch(payload: CreateBranchPayload) {
  // Usa fetchAPI que maneja la base URL y headers (incluye Authorization si existe)
  const res = await fetchAPI("/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res;
}
