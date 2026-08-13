import type { Doc } from "../_generated/dataModel";
import type { StudioClipsProgressEvent } from "../../lib/clipstitchr/types/studioClips/StudioClipsProgressEvent";

export function toStudioClipsProgressEvent(
  event: Doc<"studioClipsTaskEvents">,
): StudioClipsProgressEvent {
  return {
    attempt: event.attempt,
    checkpoint: event.checkpoint,
    code: event.code,
    ...(event.failure ? { failure: event.failure } : {}),
    occurredAt: event.occurredAt,
    progressPercent: event.progressPercent,
    ...(event.resumeCheckpoint && event.resumeRevision
      ? {
          resume: {
            checkpoint: event.resumeCheckpoint as Exclude<
              typeof event.resumeCheckpoint,
              "claim_validated" | "completed"
            >,
            revision: event.resumeRevision,
          },
        }
      : {}),
    schemaVersion: "studio-clips-progress-v1",
    status: event.status,
  };
}
