import type { Doc } from "../_generated/dataModel";
import type { StudioClipsImmutableSourceOutput } from "../../lib/clipstitchr/types/studioClips/StudioClipsImmutableSourceOutput";
import type { StudioClipsRenderOperation } from "../../lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import type { StudioClipsWorkerRenderRevisionClaim } from "../../lib/clipstitchr/types/studioClips/StudioClipsWorkerRenderRevisionClaim";

export function toStudioClipsWorkerRenderRevisionClaim(
  value: Doc<"studioClipsRenderRevisions">,
): StudioClipsWorkerRenderRevisionClaim {
  if (!value.leaseId) throw new Error("Studio Clips render revision has no worker lease.");
  let operation: StudioClipsRenderOperation;
  let sourceOutputs: StudioClipsImmutableSourceOutput[];
  try {
    operation = JSON.parse(value.operationJson) as StudioClipsRenderOperation;
    sourceOutputs = JSON.parse(
      value.sourceOutputsJson,
    ) as StudioClipsImmutableSourceOutput[];
  } catch {
    throw new Error("Studio Clips render revision snapshot is invalid.");
  }
  const sourceOutput = sourceOutputs[0];
  if (
    !sourceOutput ||
    sourceOutput.id !== value.sourceOutputId ||
    sourceOutput.revision !== value.sourceOutputRevision ||
    operation.kind !== value.operationKind
  ) {
    throw new Error("Studio Clips render revision snapshot is invalid.");
  }
  return {
    attempt: value.attempt,
    leaseId: value.leaseId,
    mode: "render_revision",
    operation,
    ownerId: value.ownerId,
    productId: value.productId,
    renderRevisionId: value.id,
    requestedAt: value.createdAt,
    ...(value.resumeCheckpoint && value.resumeRevision
      ? {
          resume: {
            checkpoint: value.resumeCheckpoint as Exclude<
              typeof value.resumeCheckpoint,
              "claim_validated" | "completed"
            >,
            revision: value.resumeRevision,
          },
        }
      : {}),
    schemaVersion: "studio-clips-claim-v2",
    sourceOutput,
    sourceOutputs,
    taskId: value.taskId,
  };
}
