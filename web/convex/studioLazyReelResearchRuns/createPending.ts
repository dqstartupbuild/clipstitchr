import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRunCreateRateLimits } from "../studioLazyReel/consumeStudioLazyReelRunCreateRateLimits";
import { normalizeStudioLazyReelJsonSnapshot } from "../studioLazyReel/normalizeStudioLazyReelJsonSnapshot";
import { studioLazyReelIdentityValidator } from "../validators/studioLazyReelIdentity";
import { studioLazyReelJsonSnapshotInputValidator } from "../validators/studioLazyReelJsonSnapshotInput";

export const createPending = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    idempotencyKey: v.string(),
    identity: studioLazyReelIdentityValidator,
    sourceSnapshotVersion: v.string(),
    inputSnapshot: studioLazyReelJsonSnapshotInputValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioLazyReelBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });

    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioLazyReelActiveProduct(ctx, ownerId, productId);

    const id = assertStudioLazyReelBoundedString(args.id, {
      label: "Research run ID",
      maxLength: 120,
    });
    const idempotencyKey = assertStudioLazyReelBoundedString(
      args.idempotencyKey,
      { label: "Idempotency key", maxLength: 200 },
    );
    const sourceSnapshotVersion = assertStudioLazyReelBoundedString(
      args.sourceSnapshotVersion,
      { label: "Source snapshot version", maxLength: 80 },
    );
    const inputSnapshot = normalizeStudioLazyReelJsonSnapshot(
      args.inputSnapshot,
      { label: "Research input snapshot", maxBytes: 32_768 },
    );
    const [existingById, existingByIdempotency] = await Promise.all([
      ctx.db
        .query("studioLazyReelResearchRuns")
        .withIndex("by_owner_product_id", (query) =>
          query
            .eq("ownerId", ownerId)
            .eq("productId", productId)
            .eq("id", id),
        )
        .unique(),
      ctx.db
        .query("studioLazyReelResearchRuns")
        .withIndex("by_owner_product_idempotency", (query) =>
          query
            .eq("ownerId", ownerId)
            .eq("productId", productId)
            .eq("idempotencyKey", idempotencyKey),
        )
        .unique(),
    ]);

    if (
      existingById &&
      existingByIdempotency &&
      existingById._id !== existingByIdempotency._id
    ) {
      throw new Error("Research run identity conflicts with an existing run.");
    }

    const existing = existingByIdempotency ?? existingById;

    if (existing) {
      const isMatchingRetry =
        existing.idempotencyKey === idempotencyKey &&
        existing.identity.kind === args.identity.kind &&
        existing.identity.key === args.identity.key &&
        existing.sourceSnapshotVersion === sourceSnapshotVersion &&
        existing.inputSnapshot.schemaVersion === inputSnapshot.schemaVersion &&
        existing.inputSnapshot.payloadJson === inputSnapshot.payloadJson;

      if (!isMatchingRetry) {
        throw new Error("Idempotency key was reused with different research input.");
      }

      return { created: false, run: existing };
    }

    await consumeStudioLazyReelRunCreateRateLimits(ctx, ownerId);

    const now = new Date().toISOString();
    const documentId = await ctx.db.insert("studioLazyReelResearchRuns", {
      ownerId,
      id,
      productId,
      identity: args.identity,
      status: "pending",
      recordVersion: 1,
      sourceSnapshotVersion,
      idempotencyKey,
      inputSnapshot,
      createdAt: now,
      updatedAt: now,
    });
    const run = await ctx.db.get(documentId);

    if (!run) {
      throw new Error("Research run could not be read after creation.");
    }

    return { created: true, run };
  },
});
