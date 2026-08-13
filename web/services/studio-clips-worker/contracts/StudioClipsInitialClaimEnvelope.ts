import type { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import type { StudioClipsClaimOptions } from "./StudioClipsClaimOptions";
import type { StudioClipsClaimSource } from "./StudioClipsClaimSource";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";

export type StudioClipsInitialClaimEnvelope = {
  attempt: number;
  leaseId: string;
  mode: "initial";
  options: StudioClipsClaimOptions;
  ownerId: string;
  productId: string;
  requestedAt: string;
  resume?: StudioClipsResumePointer;
  schemaVersion: typeof STUDIO_CLIPS_CLAIM_SCHEMA_VERSION;
  source: StudioClipsClaimSource;
  taskId: string;
};
