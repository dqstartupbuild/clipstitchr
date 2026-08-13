import type { Doc } from "../_generated/dataModel";
import type { StudioClipsRenderRevisionSummary } from "../../lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";

export function toStudioClipsRenderRevisionSummary(
  value: Doc<"studioClipsRenderRevisions">,
): StudioClipsRenderRevisionSummary {
  return {
    attempt: value.attempt,
    cancelRequested: Boolean(value.cancelRequestedAt),
    createdAt: value.createdAt,
    ...(value.failure ? { failure: value.failure } : {}),
    id: value.id,
    operationKind: value.operationKind,
    outputIds: value.outputIds,
    ...(value.platformPreset ? { platformPreset: value.platformPreset } : {}),
    productId: value.productId,
    progressPercent: value.progressPercent,
    revision: value.revision,
    sourceOutputId: value.sourceOutputId,
    status: value.status,
    taskId: value.taskId,
    updatedAt: value.updatedAt,
  };
}
