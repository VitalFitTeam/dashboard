export interface GymClass {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  instructorId: string;
  instructorName: string;
  maxCapacity: number;
  branchId: string;
  branchName: string;
  service_id?: string;
}
