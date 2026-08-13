import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { consumeStudioClipsRenderRevisionCreateRateLimits } from "../studioClipsRateLimits/consumeStudioClipsRenderRevisionCreateRateLimits";
import { assertStudioClipsMergeOutputs } from "../studioClipsOutputs/assertStudioClipsMergeOutputs";
import { getStudioClipsOutputForOwnerProduct } from "../studioClipsOutputs/getStudioClipsOutputForOwnerProduct";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { assertStudioClipsMatchingWriteReceipt } from "../studioClipsTasks/assertStudioClipsMatchingWriteReceipt";
import { createStudioClipsRequestFingerprint } from "../studioClipsTasks/createStudioClipsRequestFingerprint";
import { createStudioClipsWriteReceipt } from "../studioClipsTasks/createStudioClipsWriteReceipt";
import { getStudioClipsExecutionAvailability } from "../studioClipsTasks/getStudioClipsExecutionAvailability";
import { getStudioClipsTaskForOwnerProduct } from "../studioClipsTasks/getStudioClipsTaskForOwnerProduct";
import { getStudioClipsWriteReceipt } from "../studioClipsTasks/getStudioClipsWriteReceipt";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { studioClipsRenderOperationValidator } from "../validators/studioClipsRenderOperation";
import { assertStudioClipsSourceOutputIsImmutable } from "./assertStudioClipsSourceOutputIsImmutable";
import { getStudioClipsProductHasActiveWork } from "./getStudioClipsProductHasActiveWork";
import { getStudioClipsRenderRevisionForOwnerProduct } from "./getStudioClipsRenderRevisionForOwnerProduct";
import { normalizeStudioClipsRenderOperation } from "./normalizeStudioClipsRenderOperation";
import { toStudioClipsRenderRevisionSummary } from "./toStudioClipsRenderRevisionSummary";
import { toStudioClipsImmutableSourceOutput } from "./toStudioClipsImmutableSourceOutput";

export const create = mutation({
  args: {
    id: v.string(),
    idempotencyKey: v.string(),
    operation: studioClipsRenderOperationValidator,
    productId: v.string(),
    schemaVersion: v.literal("studio-clips-render-revision-request-v1"),
    sourceOutputId: v.string(),
    sourceOutputRevision: v.number(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const taskId = assertStudioClipsIdentifier(
      args.taskId,
      "Studio Clips task ID",
    );
    const task = await getStudioClipsTaskForOwnerProduct(
      ctx,
      ownerId,
      productId,
      taskId,
    );
    if (!task || task.archivedAt || task.status !== "completed") {
      throw new Error("A completed active Studio Clips task is required.");
    }
    const sourceOutputId = assertStudioClipsIdentifier(
      args.sourceOutputId,
      "Studio Clips output ID",
    );
    if (
      !Number.isInteger(args.sourceOutputRevision) ||
      args.sourceOutputRevision < 1
    ) {
      throw new Error("Studio Clips source output revision is invalid.");
    }
    const sourceOutput = await getStudioClipsOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      sourceOutputId,
    );
    if (!sourceOutput || sourceOutput.taskId !== taskId) {
      throw new Error("Studio Clips source output not found.");
    }
    assertStudioClipsSourceOutputIsImmutable(
      sourceOutput,
      args.sourceOutputRevision,
    );
    const operation = normalizeStudioClipsRenderOperation(
      args.operation,
      ownerId,
      productId,
    );
    if (operation.kind === "project_style") {
      throw new Error(
        "Use the Product style endpoint for Product-wide styling.",
      );
    }
    const sourceOutputs =
      operation.kind === "merge"
        ? await assertStudioClipsMergeOutputs(ctx, {
            outputIds: operation.outputIds,
            ownerId,
            productId,
            taskId,
          })
        : [sourceOutput];
    if (operation.kind === "merge") {
      if (operation.outputIds[0] !== sourceOutputId) {
        throw new Error(
          "The first ordered merge output must be the source output.",
        );
      }
    }
    const immutableSourceOutputs = sourceOutputs.map((output) => {
      assertStudioClipsSourceOutputIsImmutable(output, output.revision);
      return toStudioClipsImmutableSourceOutput(output);
    });
    const sourceOutputsJson = JSON.stringify(immutableSourceOutputs);
    const sourceOutputsByteLength = new TextEncoder().encode(
      sourceOutputsJson,
    ).byteLength;
    if (
      sourceOutputsByteLength >
      STUDIO_CLIPS_PERSISTENCE_LIMITS.checkpointSnapshotBytes
    ) {
      throw new Error("Studio Clips source output snapshot is too large.");
    }
    const id = assertStudioClipsIdentifier(args.id, "Render revision ID");
    const idempotencyKey = assertStudioClipsBoundedText(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
    });
    const operationJson = JSON.stringify(operation);
    const operationByteLength = new TextEncoder().encode(
      operationJson,
    ).byteLength;
    if (
      operationByteLength > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputSnapshotBytes
    ) {
      throw new Error("Studio Clips render revision request is too large.");
    }
    const requestFingerprint = await createStudioClipsRequestFingerprint(
      JSON.stringify({
        operation,
        productId,
        sourceOutputId,
        sourceOutputRevision: args.sourceOutputRevision,
        taskId,
      }),
    );
    const receipt = await getStudioClipsWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioClipsMatchingWriteReceipt(receipt, {
        operation: "render_revision_create",
        productId,
        requestFingerprint,
        targetId: receipt.targetId,
      });
      const existing = await getStudioClipsRenderRevisionForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!existing)
        throw new Error("The idempotent render revision is missing.");
      return {
        created: false,
        renderRevision: toStudioClipsRenderRevisionSummary(existing),
      };
    }
    if (
      await getStudioClipsRenderRevisionForOwnerProduct(
        ctx,
        ownerId,
        productId,
        id,
      )
    ) {
      throw new Error("Studio Clips render revision ID already exists.");
    }
    await consumeStudioClipsRenderRevisionCreateRateLimits(ctx, ownerId);
    if (await getStudioClipsProductHasActiveWork(ctx, { ownerId, productId })) {
      throw new Error("This Product already has active Studio Clips work.");
    }
    const execution = getStudioClipsExecutionAvailability();
    const now = new Date().toISOString();
    await ctx.db.insert("studioClipsRenderRevisions", {
      attempt: 0,
      createdAt: now,
      execution,
      id,
      operationByteLength,
      operationJson,
      operationKind: operation.kind,
      outputIds: [],
      ownerId,
      ...(operation.kind === "platform_export"
        ? { platformPreset: operation.preset }
        : {}),
      productId,
      progressPercent: 0,
      recordVersion: 1,
      revision: 1,
      sourceOutputId,
      sourceOutputRevision: args.sourceOutputRevision,
      sourceOutputsByteLength,
      sourceOutputsJson,
      status:
        execution.state === "available" ? "queued" : "provider_unavailable",
      taskId,
      updatedAt: now,
    });
    await createStudioClipsWriteReceipt(ctx, {
      changed: true,
      createdAt: now,
      idempotencyKey,
      operation: "render_revision_create",
      ownerId,
      productId,
      requestFingerprint,
      resultingRevision: 1,
      targetId: id,
    });
    const created = await getStudioClipsRenderRevisionForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!created)
      throw new Error("Studio Clips render revision was not created.");
    return {
      created: true,
      renderRevision: toStudioClipsRenderRevisionSummary(created),
    };
  },
});
