export type StudioReelWorkerAvailability = {
  readonly state: "configured" | "unavailable";
  readonly reason: string | null;
};
