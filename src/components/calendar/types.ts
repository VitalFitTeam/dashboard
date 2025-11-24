export interface GymClass {
  id: string;
  title: string;
  // start/end can be ISO strings or Date objects depending on how events are created
  start: string | Date;
  end: string | Date;
  type: string;
  instructorId: string;
  instructorName: string;
  maxCapacity: number;
  branchId: string;
  branchName: string;
  service_id?: string;
}
