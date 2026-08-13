import type { StudioReelWorkerClaimRecipe } from "./StudioReelWorkerClaimRecipe";
import type { StudioReelWorkerResumePointer } from "./StudioReelWorkerResumePointer";

export type StudioReelWorkerClaimEnvelope = {
  readonly schemaVersion: "studio-stitch-claim-v1";
  readonly ownerId: string;
  readonly productId: string;
  readonly runId: string;
  readonly runAttempt: number;
  readonly leaseAttempt: number;
  readonly leaseId: string;
  readonly leaseExpiresAt: string;
  readonly requestedAt: string;
  readonly recipes: readonly StudioReelWorkerClaimRecipe[];
  readonly resume?: StudioReelWorkerResumePointer;
};
