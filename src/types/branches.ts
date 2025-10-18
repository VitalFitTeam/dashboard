// Para las sucursales ya creada
export type Branches = {
  id: string;
  name: string;
  taxId: string;
  address?: string | null;
  cityId: string;
  latitude?: number | null;
  longitude?: number | null;
  maxCapacity?: number | null;
  phone?: string | null;
  status: "active" | "inactive" | "maintenance";
  administrator?: string;
  city?: string;
  country?: string;
  operatingHours?: BranchOperatingHours[];
};

export type BranchPayload = {
  name: string;
  taxId: string;
  cityId: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  maxCapacity?: number | null;
  phone?: string | null;
  status: "active" | "inactive" | "maintenance";
  administrator?: string;
  operatingHours: BranchOperatingHours[];
};

export type CreateBranchPayload = BranchPayload;
export type ModifyBranchPayload = BranchPayload;

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type BranchOperatingHours = {
  hourId?: string;
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};
