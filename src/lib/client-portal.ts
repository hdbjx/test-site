export type ProgressEvent = { stage: string; at: string };
export type CrewMember = { id: string; name: string; role: string };
export type PortalVehicle = {
  id: string;
  vehicleId: string | null;
  label: string;
  serviceName: string;
  progress: ProgressEvent[];
};
export type PortalJob = {
  id: string;
  serviceName: string;
  vehicle: string;
  scheduledStart: string;
  scheduledEnd: string | null;
  status: string;
  address: string | null;
  price: number | null;
  startedAt: string | null;
  completedAt: string | null;
  crew: CrewMember[];
  jobProgress: ProgressEvent[];
  vehicles: PortalVehicle[];
};
