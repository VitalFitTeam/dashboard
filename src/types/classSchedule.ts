export type ClassSchedule = {
  scheduleId: string;
  branchId: string;
  serviceId: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  serviceName?: string;
  instructorName?: string;
};
