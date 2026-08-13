import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { StudioClipsAnalysis } from "../../lib/clipstitchr/types/studioClips/StudioClipsAnalysis";
import { consumeStudioClipsWorkerWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsWorkerWriteRateLimits";
import { createStudioClipsDefaultEditState } from "../studioClipsOutputs/createStudioClipsDefaultEditState";
import { toStudioClipsOutput } from "../studioClipsOutputs/toStudioClipsOutput";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { createStudioClipsOutputId } from "./createStudioClipsOutputId";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";
import { normalizeStudioClipsAnalysis } from "./normalizeStudioClipsAnalysis";
import { normalizeStudioClipsDurableOutput } from "./normalizeStudioClipsDurableOutput";
import { completeStudioClipsRenderRevision } from "./completeStudioClipsRenderRevision";
import { createStudioClipsOutputCaptionCues } from "./createStudioClipsOutputCaptionCues";

export const complete = mutation({
  args: {
    analysisJson: v.optional(v.string()),
    attempt: v.number(),
    leaseId: v.string(),
    outputs: v.array(
      v.object({
        artifactId: v.string(),
        audioCodec: v.optional(v.string()),
        contentType: v.string(),
        durationSeconds: v.number(),
        fileName: v.optional(v.string()),
        hasAudio: v.boolean(),
        height: v.number(),
        objectKey: v.string(),
        sha256: v.string(),
        sizeBytes: v.number(),
        sourceOutputId: v.optional(v.string()),
        videoCodec: v.string(),
        width: v.number(),
        cleanMaster: v.optional(
          v.object({
            contentType: v.string(),
            objectKey: v.string(),
            sha256: v.string(),
            sizeBytes: v.number(),
          }),
        ),
      }),
    ),
    ownerId: v.string(),
    productId: v.string(),
    secret: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const task = await getStudioClipsWorkerTask(ctx, args);
    if (task && "operationJson" in task) {
      return await completeStudioClipsRenderRevision(ctx, args, task);
    }
    if (task?.status === "completed") {
      if (task.attempt !== args.attempt) {
        throw new Error("Studio Clips completion attempt does not match the task.");
      }
      const existing = await ctx.db
        .query("studioClipsOutputs")
        .withIndex("by_owner_product_task_created", (query) =>
          query
            .eq("ownerId", task.ownerId)
            .eq("productId", task.productId)
            .eq("taskId", task.id),
        )
        .order("asc")
        .collect();
      return { completed: false, outputs: existing.map(toStudioClipsOutput) };
    }
    assertStudioClipsWorkerLease(task, args);
    if (!task) throw new Error("Studio Clips task not found.");
    const leasedTask = task;
    if (leasedTask.status !== "processing" || leasedTask.cancelRequestedAt) {
      throw new Error("Studio Clips task is not eligible for completion.");
    }
    if (
      args.outputs.length === 0 ||
      args.outputs.length > 10 ||
      new Set(args.outputs.map((output) => output.artifactId)).size !==
        args.outputs.length
    ) {
      throw new Error("Studio Clips completion outputs are invalid.");
    }
    const outputs = args.outputs.map((output) =>
      normalizeStudioClipsDurableOutput(output, {
        ownerId: leasedTask.ownerId,
        productId: leasedTask.productId,
        taskId: leasedTask.id,
      }),
    );
    let analysis:
      | { byteLength: number; json: string; value: StudioClipsAnalysis }
      | undefined;
    if (args.analysisJson) {
      let value: StudioClipsAnalysis;
      try {
        value = JSON.parse(args.analysisJson) as StudioClipsAnalysis;
      } catch {
        throw new Error("Studio Clips analysis JSON is invalid.");
      }
      const normalized = normalizeStudioClipsAnalysis(value);
      const json = JSON.stringify(normalized);
      const byteLength = new TextEncoder().encode(json).byteLength;
      if (byteLength > STUDIO_CLIPS_PERSISTENCE_LIMITS.analysisSnapshotBytes) {
        throw new Error("Studio Clips analysis is too large.");
      }
      analysis = { byteLength, json, value: normalized };
    }
    await consumeStudioClipsWorkerWriteRateLimits(ctx, leasedTask.ownerId);
    const now = new Date().toISOString();
    const createdIds: string[] = [];
    for (const output of outputs) {
      const { cleanMaster, ...durableOutput } = output;
      const id = await createStudioClipsOutputId(leasedTask.id, output.artifactId);
      const editSnapshotJson = JSON.stringify(createStudioClipsDefaultEditState());
      const captionCues = createStudioClipsOutputCaptionCues(
        analysis?.value,
        output.artifactId,
      );
      const captionCuesJson = JSON.stringify(captionCues);
      await ctx.db.insert("studioClipsOutputs", {
        ...durableOutput,
        ...(cleanMaster
          ? {
              cleanMasterContentType: cleanMaster.contentType,
              cleanMasterObjectKey: cleanMaster.objectKey,
              cleanMasterSha256: cleanMaster.sha256,
              cleanMasterSizeBytes: cleanMaster.sizeBytes,
            }
          : {}),
        captionCuesByteLength: new TextEncoder().encode(captionCuesJson).byteLength,
        captionCuesJson,
        captionsBurned: leasedTask.options.addSubtitles && captionCues.length > 0,
        createdAt: now,
        editSnapshotByteLength: new TextEncoder().encode(editSnapshotJson).byteLength,
        editSnapshotJson,
        editSnapshotVersion: 1,
        id,
        ownerId: leasedTask.ownerId,
        productId: leasedTask.productId,
        recordVersion: 1,
        revision: 1,
        taskId: leasedTask.id,
        updatedAt: now,
      });
      createdIds.push(id);
    }
    await ctx.db.patch(leasedTask._id, {
      ...(analysis
        ? {
            analysisSnapshotByteLength: analysis.byteLength,
            analysisSnapshotJson: analysis.json,
            analysisSnapshotVersion: 1,
          }
        : {}),
      checkpoint: "completed",
      completedAt: now,
      latestCode: "completed",
      leaseExpiresAt: undefined,
      leaseId: undefined,
      leaseWorkerId: undefined,
      progressPercent: 100,
      revision: leasedTask.revision + 1,
      status: "completed",
      updatedAt: now,
    });
    const created = [];
    for (const id of createdIds) {
      const output = await ctx.db
        .query("studioClipsOutputs")
        .withIndex("by_owner_product_id", (query) =>
          query
            .eq("ownerId", leasedTask.ownerId)
            .eq("productId", leasedTask.productId)
            .eq("id", id),
        )
        .unique();
      if (output) created.push(toStudioClipsOutput(output));
    }
    return { completed: true, outputs: created };
  },
});
