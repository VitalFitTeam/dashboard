export type EquipmentCategory =
  | "Cardio"
  | "Strength"
  | "FreeWeight"
  | "Functional"
  | "Accessory";

export type Equipment = {
  id: string;
  name: string;
  category: EquipmentCategory;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
};
