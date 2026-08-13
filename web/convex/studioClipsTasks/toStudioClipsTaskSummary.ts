import type { Doc } from "../_generated/dataModel";
import type { StudioClipsTaskSummary } from "../../lib/clipstitchr/types/studioClips/StudioClipsTaskSummary";
import type { StudioClipsRenderRevisionSummary } from "../../lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";

export function toStudioClipsTaskSummary(
  task: Doc<"studioClipsTasks">,
  outputCount: number,
  activeRenderRevision?: StudioClipsRenderRevisionSummary,
): StudioClipsTaskSummary {
  return {
    ...(activeRenderRevision ? { activeRenderRevision } : {}),
    ...(task.archivedAt ? { archivedAt: task.archivedAt } : {}),
    attempt: task.attempt,
    ...(task.checkpoint ? { checkpoint: task.checkpoint } : {}),
    createdAt: task.createdAt,
    execution: task.execution,
    ...(task.failure ? { failure: task.failure } : {}),
    id: task.id,
    outputCount,
    productId: task.productId,
    progressPercent: task.progressPercent,
    revision: task.revision,
    sourceKind: task.source.kind,
    status: task.status,
    updatedAt: task.updatedAt,
  };
}
