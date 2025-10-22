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

type StatsData = {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
};

export type BranchesFetchResult = {
  data: BranchesTableRow[];
  total: number;
  stats: StatsData;
};

interface ApiCount {
  active: number;
  inactive: number;
  maintenance: number;
  total: number;
}

interface ApiBranchesResponse {
  count: ApiCount;
  data: ApiBranch[];
}

interface FetchBranchesParams {
  limit: number;
  offset: number;
  sort: "asc" | "desc";
  search?: string;
  status?: string;
  token: string | null;
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
  status?: string | null;
  tax_id?: string | null;
};

interface ApiOperatingHour {
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface ApiPaymentMethodLink {
  method: {
    method_id: string;
    name: string;
    type: string;
  };
}

interface ApiBranchDetails {
  branch_id: string;
  name: string;
  tax_id: string;
  phone: string;
  status: string;
  address: string;
  country: string; 
  state: string;  
  latitude: number;
  longitude: number;
  manager_first_name: string;
  manager_last_name: string;
  max_capacity: number;
  operating_hours: ApiOperatingHour[];
  payment_methods: ApiPaymentMethodLink[];
}

export interface OperatingHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface BranchPaymentMethod {
  id: string;
  name: string;
  type: string;
}

export interface BranchDetails {
  id: string;
  name: string;
  taxId: string;
  phone: string;
  status: string;
  location: {
    address: string;
    country: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  manager: {
    firstName: string;
    lastName: string;
  };
  capacity: number;
  operatingHours: OperatingHour[];
  paymentMethods: BranchPaymentMethod[];
}

interface ApiResponse {
  data: ApiBranchDetails;
}

/* ────────────────────────────────
   🔹 Crear Sucursal
──────────────────────────────── */
export async function createBranch(payload: CreateBranchPayload) {
  const res = await fetchAPI("/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

/* ────────────────────────────────
   🔹 Eliminar Sucursal
──────────────────────────────── */
export async function deleteBranch(id: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/branches/${id}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (error) {
    console.error("❌ Error eliminando sucursal:", error);
    throw error;
  }
}

/* ────────────────────────────────
   🔹 Obtener Sucursales
──────────────────────────────── */
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

  if (search) {query.append("search", search);}
  if (status) {query.append("status", status);}

  const res: ApiBranchesResponse = await fetchAPI(
    `/branches?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.data || !res.count) {
    console.error("⚠️ Respuesta inválida: falta 'data' o 'count'");
    return {
      data: [],
      total: 0,
      stats: { total: 0, active: 0, inactive: 0, maintenance: 0 },
    };
  }

  const statsResult: StatsData = {
    total: res.count.total,
    active: res.count.active,
    inactive: res.count.inactive,
    maintenance: res.count.maintenance,
  };

  const mappedData: BranchesTableRow[] = res.data.map((b) => ({
    id: b.branch_id,
    name: b.name,
    taxId: b.tax_id,
    administrator:
      `${b.manager_name ?? ""} ${b.manager_last_name ?? ""}`.trim(),
    state: b.state_name,
    country: b.country_name,
    status: b.status as "Active" | "Inactive" | "Maintenance",
  }));

  return {
    data: mappedData,
    total: res.count.total,
    stats: statsResult,
  };
}


export async function fetchBranchDetails(
  branchId: string
): Promise<BranchDetails> {
  const data: ApiBranchDetails = await fetchAPI(`/branches/${branchId}`);

  if (!data.branch_id) { 
    throw new Error("Respuesta de API inválida, faltan datos");
  }

  const mappedData: BranchDetails = {
    id: data.branch_id,
    name: data.name,
    taxId: data.tax_id,
    phone: data.phone,
    status: data.status,
    location: {
      address: data.address,
      country: data.country,
      state: data.state,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    manager: {
      firstName: data.manager_first_name,
      lastName: data.manager_last_name,
    },
    capacity: data.max_capacity,
    operatingHours: data.operating_hours.map((h) => ({
      dayOfWeek: h.day_of_week,
      openTime: h.open_time,
      closeTime: h.close_time,
      isClosed: h.is_closed,
    })),
    paymentMethods: data.payment_methods.map((pm) => ({
      id: pm.method.method_id,
      name: pm.method.name,
      type: pm.method.type,
    })),
  };

  return mappedData;
}

function mapFormDataToApi(data: Branches): CreateBranchPayload {
  return {
    name: data.name,
    tax_id: data.taxId,
    status: data.status,
    phone: data.phone,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    max_capacity: data.capacity,
    manager_id: data.administrator, // Mapea 'administrator' a 'manager_id'
    
    // Asumo que la API de PUT espera los NOMBRES (como en create)
    // Si espera los IDs, usa: data.countryId, data.stateId
    country: data.country, 
    state: data.state,
    
    payment_methods: data.paymethods,
    
    operating_hours: data.operatingHours.map(h => ({
      day_of_week: h.dayOfWeek,
      open_time: h.openTime,
      close_time: h.closeTime,
      is_closed: h.isClosed,
    })),
    
    // (Añade 'services' e 'inventory' si también se actualizan aquí)
  };
}


export async function updateBranch(id: string, formData: Branches) {
  // 1. Convierte los datos del formulario al formato de la API
  const payload = mapFormDataToApi(formData);

  // 2. Llama a la API con PUT
  const res = await fetchAPI(`/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}