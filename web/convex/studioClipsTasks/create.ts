import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { studioClipsSourceValidator } from "../validators/studioClipsSource";
import { studioClipsTaskOptionsValidator } from "../validators/studioClipsTaskOptions";
import { consumeStudioClipsTaskCreateRateLimits } from "../studioClipsRateLimits/consumeStudioClipsTaskCreateRateLimits";
import { assertStudioClipsActiveProduct } from "./assertStudioClipsActiveProduct";
import { assertStudioClipsBoundedText } from "./assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { assertStudioClipsMatchingWriteReceipt } from "./assertStudioClipsMatchingWriteReceipt";
import { createStudioClipsRequestFingerprint } from "./createStudioClipsRequestFingerprint";
import { createStudioClipsWriteReceipt } from "./createStudioClipsWriteReceipt";
import { getStudioClipsExecutionAvailability } from "./getStudioClipsExecutionAvailability";
import { getStudioClipsTaskForOwnerProduct } from "./getStudioClipsTaskForOwnerProduct";
import { getStudioClipsWriteReceipt } from "./getStudioClipsWriteReceipt";
import { normalizeStudioClipsSource } from "./normalizeStudioClipsSource";
import { normalizeStudioClipsTaskOptions } from "./normalizeStudioClipsTaskOptions";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "./studioClipsPersistenceLimits";
import { toStudioClipsTaskDetail } from "./toStudioClipsTaskDetail";
import { getStudioClipsProductHasActiveWork } from "../studioClipsRenderRevisions/getStudioClipsProductHasActiveWork";
import { getStudioClipsProductStyleForOwnerProduct } from "../studioClipsProductStyles/getForOwnerProduct";

export const create = mutation({
  args: {
    id: v.string(),
    idempotencyKey: v.string(),
    options: studioClipsTaskOptionsValidator,
    productId: v.string(),
    schemaVersion: v.literal("studio-clips-create-v1"),
    source: studioClipsSourceValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const id = assertStudioClipsIdentifier(args.id, "Studio Clips task ID");
    const idempotencyKey = assertStudioClipsBoundedText(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: STUDIO_CLIPS_PERSISTENCE_LIMITS.idempotencyKeyCharacters,
    });
    const source = normalizeStudioClipsSource(args.source, ownerId, productId);
    const requestedOptions = normalizeStudioClipsTaskOptions(
      args.options,
      ownerId,
      productId,
    );
    const requestFingerprint = await createStudioClipsRequestFingerprint(
      JSON.stringify({ options: requestedOptions, productId, source }),
    );
    const receipt = await getStudioClipsWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioClipsMatchingWriteReceipt(receipt, {
        operation: "create",
        productId,
        requestFingerprint,
        targetId: receipt.targetId,
      });
      const existing = await getStudioClipsTaskForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!existing)
        throw new Error("The idempotent Studio Clips task is missing.");
      return {
        created: false,
        task: await toStudioClipsTaskDetail(ctx, existing),
      };
    }
    if (await getStudioClipsTaskForOwnerProduct(ctx, ownerId, productId, id)) {
      throw new Error("Studio Clips task ID already exists.");
    }
    const productStyle = requestedOptions.captionStyle
      ? null
      : await getStudioClipsProductStyleForOwnerProduct(ctx, {
          ownerId,
          productId,
        });
    const options = productStyle
      ? { ...requestedOptions, captionStyle: productStyle.style }
      : requestedOptions;
    const inputJson = JSON.stringify({ options, productId, source });
    const inputByteLength = new TextEncoder().encode(inputJson).byteLength;
    if (inputByteLength > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputSnapshotBytes) {
      throw new Error("The Studio Clips task request is too large.");
    }
    await consumeStudioClipsTaskCreateRateLimits(ctx, ownerId);
    const execution = getStudioClipsExecutionAvailability();
    if (
      execution.state === "available" &&
      (await getStudioClipsProductHasActiveWork(ctx, { ownerId, productId }))
    ) {
      throw new Error("This Product already has an active Studio Clips task.");
    }
    const now = new Date().toISOString();
    await ctx.db.insert("studioClipsTasks", {
      attempt: 0,
      createdAt: now,
      execution,
      id,
      inputByteLength,
      options,
      ownerId,
      productId,
      progressPercent: 0,
      recordVersion: 1,
      revision: 1,
      source,
      status:
        execution.state === "available" ? "queued" : "provider_unavailable",
      updatedAt: now,
    });
    await createStudioClipsWriteReceipt(ctx, {
      changed: true,
      createdAt: now,
      idempotencyKey,
      operation: "create",
      ownerId,
      productId,
      requestFingerprint,
      resultingRevision: 1,
      targetId: id,
    });
    const task = await getStudioClipsTaskForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    if (!task) throw new Error("Studio Clips task could not be created.");
    return { created: true, task: await toStudioClipsTaskDetail(ctx, task) };
  },
});
