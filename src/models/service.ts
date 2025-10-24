export type ServiceCategory = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  categoryId: string;
  description?: string | null;
  durationMinutes?: number | null;
};
