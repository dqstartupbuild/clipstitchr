import type { StudioReelWorkerAvailability } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAvailability";

export type StudioReelWorkerClaimResult =
  | {
      readonly availability: StudioReelWorkerAvailability;
      readonly state: "idle";
    }
  | {
      readonly availability: StudioReelWorkerAvailability;
      readonly runId: string;
      readonly state: "completed" | "cancelled" | "failed";
    };
