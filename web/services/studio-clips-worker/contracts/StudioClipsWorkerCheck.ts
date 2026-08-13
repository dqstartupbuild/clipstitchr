import type { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";
import type { StudioClipsCostStage } from "./StudioClipsCostStage";
import type { StudioClipsTaskStatus } from "./StudioClipsTaskStatus";

export type StudioClipsWorkerCheck = {
  checkpoints: readonly StudioClipsCheckpoint[];
  claimSchemaVersion: typeof STUDIO_CLIPS_CLAIM_SCHEMA_VERSION;
  costStages: readonly StudioClipsCostStage[];
  networkRequired: false;
  ok: true;
  service: "studio-clips-worker-core";
  statuses: readonly StudioClipsTaskStatus[];
};
