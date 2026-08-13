import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsClock } from "../contracts/StudioClipsClock";
import type { StudioClipsFailure } from "../contracts/StudioClipsFailure";
import type { StudioClipsProgressCode } from "../contracts/StudioClipsProgressCode";
import type { StudioClipsProgressPublisher } from "../contracts/StudioClipsProgressPublisher";
import type { StudioClipsResumePointer } from "../contracts/StudioClipsResumePointer";
import type { StudioClipsTaskStatus } from "../contracts/StudioClipsTaskStatus";
import { getStudioClipsProgressPercent } from "./getStudioClipsProgressPercent";

export async function publishStudioClipsProgress(input: {
  checkpoint: StudioClipsCheckpoint;
  claim: StudioClipsClaimEnvelope;
  clock: StudioClipsClock;
  code: StudioClipsProgressCode;
  failure?: StudioClipsFailure;
  progress: StudioClipsProgressPublisher;
  resume?: StudioClipsResumePointer;
  status: StudioClipsTaskStatus;
}): Promise<void> {
  await input.progress.publish({
    attempt: input.claim.attempt,
    checkpoint: input.checkpoint,
    code: input.code,
    failure: input.failure,
    occurredAt: input.clock.nowIso(),
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    progressPercent: getStudioClipsProgressPercent(input.code),
    resume: input.resume,
    schemaVersion: "studio-clips-progress-v1",
    status: input.status,
    taskId: getStudioClipsClaimWorkId(input.claim),
  });
}
