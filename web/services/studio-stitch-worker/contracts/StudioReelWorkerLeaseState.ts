import type { StudioReelWorkerAvailability } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAvailability";

export type StudioReelWorkerLeaseState = {
  readonly cancellationRequested: boolean;
  readonly execution: StudioReelWorkerAvailability;
  readonly leaseValid: boolean;
  readonly productOwned: boolean;
  readonly runFound: boolean;
  readonly status: string | null;
  readonly studioAccess: boolean;
};
