import type { Doc } from "../_generated/dataModel";
import type { StudioClipsWorkerClaimEnvelope } from "../../lib/clipstitchr/types/studioClips/StudioClipsWorkerClaimEnvelope";

export function toStudioClipsWorkerClaim(
  task: Doc<"studioClipsTasks">,
): StudioClipsWorkerClaimEnvelope {
  if (!task.leaseId) throw new Error("Studio Clips task has no worker lease.");
  return {
    attempt: task.attempt,
    leaseId: task.leaseId,
    mode: "initial",
    options: {
      addSubtitles: task.options.addSubtitles,
      ...(task.options.captionStyle
        ? { captionStyle: task.options.captionStyle }
        : {}),
      includeBroll: task.options.includeBroll,
      outputFormat: task.options.outputFormat,
    },
    ownerId: task.ownerId,
    productId: task.productId,
    requestedAt: task.createdAt,
    ...(task.resumeCheckpoint && task.resumeRevision
      ? {
          resume: {
            checkpoint: task.resumeCheckpoint as Exclude<
              typeof task.resumeCheckpoint,
              "claim_validated" | "completed"
            >,
            revision: task.resumeRevision,
          },
        }
      : {}),
    schemaVersion: "studio-clips-claim-v2",
    source: task.source,
    taskId: task.id,
  };
}
