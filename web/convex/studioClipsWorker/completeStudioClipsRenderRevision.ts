import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { StudioClipsImmutableSourceOutput } from "../../lib/clipstitchr/types/studioClips/StudioClipsImmutableSourceOutput";
import { consumeStudioClipsWorkerWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsWorkerWriteRateLimits";
import { createStudioClipsDefaultEditState } from "../studioClipsOutputs/createStudioClipsDefaultEditState";
import { toStudioClipsOutput } from "../studioClipsOutputs/toStudioClipsOutput";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { createStudioClipsOutputId } from "./createStudioClipsOutputId";
import { normalizeStudioClipsDurableOutput } from "./normalizeStudioClipsDurableOutput";
import type { StudioClipsRenderOperation } from "../../lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import { getStudioClipsRevisionCaptionState } from "./getStudioClipsRevisionCaptionState";

type StudioClipsRevisionCompletionOutput = {
  artifactId: string;
  audioCodec?: string;
  contentType: string;
  durationSeconds: number;
  fileName?: string;
  hasAudio: boolean;
  height: number;
  objectKey: string;
  sha256: string;
  sizeBytes: number;
  sourceOutputId?: string;
  videoCodec: string;
  width: number;
  cleanMaster?: {
    contentType: string;
    objectKey: string;
    sha256: string;
    sizeBytes: number;
  };
};

export async function completeStudioClipsRenderRevision(
  ctx: MutationCtx,
  args: {
    attempt: number;
    leaseId: string;
    outputs: StudioClipsRevisionCompletionOutput[];
  },
  revision: Doc<"studioClipsRenderRevisions">,
) {
  if (revision.status === "completed") {
    if (revision.attempt !== args.attempt) {
      throw new Error("Studio Clips completion attempt does not match the render revision.");
    }
    const existing = await ctx.db
      .query("studioClipsOutputs")
      .withIndex("by_owner_product_render_revision_created", (query) =>
        query
          .eq("ownerId", revision.ownerId)
          .eq("productId", revision.productId)
          .eq("renderRevisionId", revision.id),
      )
      .order("asc")
      .collect();
    return { completed: false, outputs: existing.map(toStudioClipsOutput) };
  }
  assertStudioClipsWorkerLease(revision, args);
  const leased = revision;
  if (leased.status !== "processing" || leased.cancelRequestedAt) {
    throw new Error("Studio Clips render revision is not eligible for completion.");
  }
  if (
    args.outputs.length < 1 ||
    args.outputs.length > 101 ||
    new Set(args.outputs.map((output) => output.artifactId)).size !==
      args.outputs.length
  ) {
    throw new Error("Studio Clips render revision outputs are invalid.");
  }
  let sources: StudioClipsImmutableSourceOutput[];
  let operation: StudioClipsRenderOperation;
  try {
    sources = JSON.parse(leased.sourceOutputsJson) as StudioClipsImmutableSourceOutput[];
    operation = JSON.parse(leased.operationJson) as StudioClipsRenderOperation;
  } catch {
    throw new Error("Studio Clips render revision source snapshot is invalid.");
  }
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const normalized = args.outputs.map((output) => {
    const sourceOutputId = output.sourceOutputId ?? leased.sourceOutputId;
    const source = sourceById.get(sourceOutputId);
    if (!source) throw new Error("Studio Clips render output lineage is invalid.");
    return {
      output: normalizeStudioClipsDurableOutput(output, {
        ownerId: leased.ownerId,
        productId: leased.productId,
        taskId: leased.id,
      }),
      source,
    };
  });
  await consumeStudioClipsWorkerWriteRateLimits(ctx, leased.ownerId);
  const now = new Date().toISOString();
  const createdIds: string[] = [];
  for (const [outputIndex, { output, source }] of normalized.entries()) {
    const { cleanMaster, ...durableOutput } = output;
    const id = await createStudioClipsOutputId(leased.id, output.artifactId);
    const editSnapshotJson = JSON.stringify(createStudioClipsDefaultEditState());
    const captionState = getStudioClipsRevisionCaptionState({
      operation,
      outputIndex,
      source,
      sources,
    });
    const captionCuesJson = JSON.stringify(captionState.cues);
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
      captionsBurned: captionState.captionsBurned,
      createdAt: now,
      editSnapshotByteLength: new TextEncoder().encode(editSnapshotJson).byteLength,
      editSnapshotJson,
      editSnapshotVersion: 1,
      id,
      ownerId: leased.ownerId,
      parentOutputId: source.id,
      ...(leased.platformPreset ? { platformPreset: leased.platformPreset } : {}),
      productId: leased.productId,
      recordVersion: 1,
      renderRevisionId: leased.id,
      revision: 1,
      taskId: source.taskId,
      updatedAt: now,
    });
    createdIds.push(id);
  }
  await ctx.db.patch(leased._id, {
    checkpoint: "completed",
    completedAt: now,
    latestCode: "completed",
    leaseExpiresAt: undefined,
    leaseId: undefined,
    leaseWorkerId: undefined,
    outputIds: createdIds,
    progressPercent: 100,
    revision: leased.revision + 1,
    status: "completed",
    updatedAt: now,
  });
  const created = [];
  for (const id of createdIds) {
    const output = await ctx.db
      .query("studioClipsOutputs")
      .withIndex("by_owner_product_id", (query) =>
        query
          .eq("ownerId", leased.ownerId)
          .eq("productId", leased.productId)
          .eq("id", id),
      )
      .unique();
    if (output) created.push(toStudioClipsOutput(output));
  }
  return { completed: true, outputs: created };
}
