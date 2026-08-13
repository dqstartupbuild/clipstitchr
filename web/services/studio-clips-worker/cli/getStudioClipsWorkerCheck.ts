import { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import { STUDIO_CLIPS_CHECKPOINTS } from "../contracts/StudioClipsCheckpoint";
import { STUDIO_CLIPS_COST_STAGES } from "../contracts/StudioClipsCostStage";
import { STUDIO_CLIPS_TASK_STATUSES } from "../contracts/StudioClipsTaskStatus";
import type { StudioClipsWorkerCheck } from "../contracts/StudioClipsWorkerCheck";
import { readStudioClipsClaimEnvelope } from "../validation/readStudioClipsClaimEnvelope";

export function getStudioClipsWorkerCheck(): StudioClipsWorkerCheck {
  readStudioClipsClaimEnvelope({
    attempt: 1,
    leaseId: "check_lease",
    mode: "initial",
    options: {
      addSubtitles: true,
      includeBroll: false,
      outputFormat: "vertical",
    },
    ownerId: "check_owner",
    productId: "check_product",
    requestedAt: "2026-01-01T00:00:00.000Z",
    schemaVersion: STUDIO_CLIPS_CLAIM_SCHEMA_VERSION,
    source: {
      kind: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    taskId: "check_task",
  });

  return {
    checkpoints: STUDIO_CLIPS_CHECKPOINTS,
    claimSchemaVersion: STUDIO_CLIPS_CLAIM_SCHEMA_VERSION,
    costStages: STUDIO_CLIPS_COST_STAGES,
    networkRequired: false,
    ok: true,
    service: "studio-clips-worker-core",
    statuses: STUDIO_CLIPS_TASK_STATUSES,
  };
}
