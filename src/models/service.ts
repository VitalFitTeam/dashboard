export type ServiceCategory = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  categoryId: string;
  durationMinutes?: number | null;
};
