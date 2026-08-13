import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { StudioClipsTaskDetail } from "../../lib/clipstitchr/types/studioClips/StudioClipsTaskDetail";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "./studioClipsPersistenceLimits";
import { parseStudioClipsAnalysis } from "./parseStudioClipsAnalysis";
import { toStudioClipsOutput } from "../studioClipsOutputs/toStudioClipsOutput";
import { toStudioClipsProgressEvent } from "./toStudioClipsProgressEvent";
import { toStudioClipsTaskSummary } from "./toStudioClipsTaskSummary";
import { listStudioClipsRenderRevisionsForTask } from "../studioClipsRenderRevisions/listForTask";
import { getActiveStudioClipsRenderRevisionForTask } from "../studioClipsRenderRevisions/getActiveStudioClipsRenderRevisionForTask";
import { toStudioClipsRenderRevisionSummary } from "../studioClipsRenderRevisions/toStudioClipsRenderRevisionSummary";

export async function toStudioClipsTaskDetail(
  ctx: MutationCtx | QueryCtx,
  task: Doc<"studioClipsTasks">,
): Promise<StudioClipsTaskDetail> {
  const [events, outputs, renderRevisions, activeRenderRevision] = await Promise.all([
    ctx.db
      .query("studioClipsTaskEvents")
      .withIndex("by_owner_product_task_occurred", (query) =>
        query
          .eq("ownerId", task.ownerId)
          .eq("productId", task.productId)
          .eq("taskId", task.id),
      )
      .order("desc")
      .take(STUDIO_CLIPS_PERSISTENCE_LIMITS.eventCount),
    ctx.db
      .query("studioClipsOutputs")
      .withIndex("by_owner_product_task_created", (query) =>
        query
          .eq("ownerId", task.ownerId)
          .eq("productId", task.productId)
          .eq("taskId", task.id),
      )
      .order("asc")
      .collect(),
    listStudioClipsRenderRevisionsForTask(ctx, {
      ownerId: task.ownerId,
      productId: task.productId,
      taskId: task.id,
    }),
    getActiveStudioClipsRenderRevisionForTask(ctx, {
      ownerId: task.ownerId,
      productId: task.productId,
      taskId: task.id,
    }),
  ]);
  return {
    ...toStudioClipsTaskSummary(
      task,
      outputs.length,
      activeRenderRevision
        ? toStudioClipsRenderRevisionSummary(activeRenderRevision)
        : undefined,
    ),
    ...(task.analysisSnapshotVersion && task.analysisSnapshotJson
      ? {
          analysis: parseStudioClipsAnalysis(
            task.analysisSnapshotVersion,
            task.analysisSnapshotJson,
          ),
        }
      : {}),
    cancelRequested: Boolean(task.cancelRequestedAt),
    ...(task.cancelledAt ? { cancelledAt: task.cancelledAt } : {}),
    ...(task.completedAt ? { completedAt: task.completedAt } : {}),
    ...(task.errorAt ? { errorAt: task.errorAt } : {}),
    events: events.reverse().map(toStudioClipsProgressEvent),
    options: task.options,
    outputs: outputs.map(toStudioClipsOutput),
    recordVersion: 1,
    renderRevisions,
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
    source: task.source,
    ...(task.startedAt ? { startedAt: task.startedAt } : {}),
  };
}
