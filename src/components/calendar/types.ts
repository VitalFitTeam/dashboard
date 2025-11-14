export type GymClass = {
  id: string;
  title: string;
  start: string;
  end: string;
  instructorId: string;
  instructorName?: string;
  type: string;
  branchId: string;
  maxCapacity: number;
};
