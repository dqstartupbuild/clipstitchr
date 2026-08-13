import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { consumeStudioClipsRenderRevisionCreateRateLimits } from "../studioClipsRateLimits/consumeStudioClipsRenderRevisionCreateRateLimits";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { assertStudioClipsMatchingWriteReceipt } from "../studioClipsTasks/assertStudioClipsMatchingWriteReceipt";
import { createStudioClipsRequestFingerprint } from "../studioClipsTasks/createStudioClipsRequestFingerprint";
import { createStudioClipsWriteReceipt } from "../studioClipsTasks/createStudioClipsWriteReceipt";
import { getStudioClipsExecutionAvailability } from "../studioClipsTasks/getStudioClipsExecutionAvailability";
import { getStudioClipsWriteReceipt } from "../studioClipsTasks/getStudioClipsWriteReceipt";
import { normalizeStudioClipsCaptionStyle } from "../studioClipsTasks/normalizeStudioClipsCaptionStyle";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { studioClipsCaptionStyleValidator } from "../validators/studioClipsCaptionStyle";
import { getStudioClipsProductHasActiveWork } from "../studioClipsRenderRevisions/getStudioClipsProductHasActiveWork";
import { getStudioClipsRenderRevisionForOwnerProduct } from "../studioClipsRenderRevisions/getStudioClipsRenderRevisionForOwnerProduct";
import { toStudioClipsImmutableSourceOutput } from "../studioClipsRenderRevisions/toStudioClipsImmutableSourceOutput";
import { toStudioClipsRenderRevisionSummary } from "../studioClipsRenderRevisions/toStudioClipsRenderRevisionSummary";
import { getStudioClipsProductStyleForOwnerProduct } from "./getForOwnerProduct";

export const upsert = mutation({
  args: {
    id: v.string(),
    idempotencyKey: v.string(),
    productId: v.string(),
    schemaVersion: v.literal("studio-clips-product-style-request-v1"),
    style: studioClipsCaptionStyleValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const idempotencyKey = assertStudioClipsBoundedText(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
    });
    const style = normalizeStudioClipsCaptionStyle(
      args.style,
      ownerId,
      productId,
    );
    const requestFingerprint = await createStudioClipsRequestFingerprint(
      JSON.stringify({ productId, style }),
    );
    const receipt = await getStudioClipsWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioClipsMatchingWriteReceipt(receipt, {
        operation: "product_style",
        productId,
        requestFingerprint,
        targetId: productId,
      });
      const existing = await getStudioClipsProductStyleForOwnerProduct(ctx, {
        ownerId,
        productId,
      });
      if (!existing)
        throw new Error("The saved Studio Clips Product style is missing.");
      const renderRevision = existing.lastRenderRevisionId
        ? await getStudioClipsRenderRevisionForOwnerProduct(
            ctx,
            ownerId,
            productId,
            existing.lastRenderRevisionId,
          )
        : null;
      return {
        created: false,
        productId,
        revision: existing.revision,
        ...(renderRevision
          ? {
              renderRevision:
                toStudioClipsRenderRevisionSummary(renderRevision),
            }
          : {}),
        style: existing.style,
        updatedAt: existing.updatedAt,
      };
    }

    const existing = await getStudioClipsProductStyleForOwnerProduct(ctx, {
      ownerId,
      productId,
    });
    const allOutputs = await ctx.db
      .query("studioClipsOutputs")
      .withIndex("by_owner_product_task_created", (query) =>
        query.eq("ownerId", ownerId).eq("productId", productId),
      )
      .order("asc")
      .take(200);
    const superseded = new Set(
      allOutputs.flatMap((output) =>
        output.parentOutputId ? [output.parentOutputId] : [],
      ),
    );
    const currentOutputs = allOutputs
      .filter((output) => !superseded.has(output.id))
      .slice(0, 100);
    const canQueue =
      currentOutputs.length > 0 &&
      !(await getStudioClipsProductHasActiveWork(ctx, { ownerId, productId }));
    const now = new Date().toISOString();
    const styleRevision = (existing?.revision ?? 0) + 1;
    const renderRevisionId = canQueue
      ? assertStudioClipsIdentifier(args.id, "Render revision ID")
      : undefined;

    if (canQueue && renderRevisionId) {
      await consumeStudioClipsRenderRevisionCreateRateLimits(ctx, ownerId);
      const sourceOutputs = currentOutputs.map(
        toStudioClipsImmutableSourceOutput,
      );
      const sourceOutputsJson = JSON.stringify(sourceOutputs);
      const sourceOutputsByteLength = new TextEncoder().encode(
        sourceOutputsJson,
      ).byteLength;
      if (
        sourceOutputsByteLength >
        STUDIO_CLIPS_PERSISTENCE_LIMITS.checkpointSnapshotBytes
      ) {
        throw new Error(
          "Studio Clips Product style source snapshot is too large.",
        );
      }
      const operation = { kind: "project_style" as const, style };
      const operationJson = JSON.stringify(operation);
      const execution = getStudioClipsExecutionAvailability();
      await ctx.db.insert("studioClipsRenderRevisions", {
        attempt: 0,
        createdAt: now,
        execution,
        id: renderRevisionId,
        operationByteLength: new TextEncoder().encode(operationJson).byteLength,
        operationJson,
        operationKind: "project_style",
        outputIds: [],
        ownerId,
        productId,
        progressPercent: 0,
        recordVersion: 1,
        revision: 1,
        sourceOutputId: sourceOutputs[0]!.id,
        sourceOutputRevision: sourceOutputs[0]!.revision,
        sourceOutputsByteLength,
        sourceOutputsJson,
        status:
          execution.state === "available" ? "queued" : "provider_unavailable",
        taskId: sourceOutputs[0]!.taskId,
        updatedAt: now,
      });
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastRenderRevisionId: renderRevisionId,
        revision: styleRevision,
        style,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("studioClipsProductStyles", {
        createdAt: now,
        ...(renderRevisionId ? { lastRenderRevisionId: renderRevisionId } : {}),
        ownerId,
        productId,
        recordVersion: 1,
        revision: styleRevision,
        style,
        updatedAt: now,
      });
    }
    await createStudioClipsWriteReceipt(ctx, {
      changed: true,
      createdAt: now,
      idempotencyKey,
      operation: "product_style",
      ownerId,
      productId,
      requestFingerprint,
      resultingRevision: styleRevision,
      targetId: productId,
    });
    const renderRevision = renderRevisionId
      ? await getStudioClipsRenderRevisionForOwnerProduct(
          ctx,
          ownerId,
          productId,
          renderRevisionId,
        )
      : null;
    return {
      created: !existing,
      productId,
      revision: styleRevision,
      ...(renderRevision
        ? { renderRevision: toStudioClipsRenderRevisionSummary(renderRevision) }
        : {}),
      style,
      updatedAt: now,
    };
  },
});
