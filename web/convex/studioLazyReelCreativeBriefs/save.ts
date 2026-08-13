import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRecordWriteRateLimits } from "../studioLazyReel/consumeStudioLazyReelRecordWriteRateLimits";
import { normalizeStudioLazyReelJsonSnapshot } from "../studioLazyReel/normalizeStudioLazyReelJsonSnapshot";
import { getStudioLazyReelResearchRunForOwnerProduct } from "../studioLazyReelResearchRuns/getStudioLazyReelResearchRunForOwnerProduct";
import { studioLazyReelIdentityValidator } from "../validators/studioLazyReelIdentity";
import { studioLazyReelJsonSnapshotInputValidator } from "../validators/studioLazyReelJsonSnapshotInput";
import { getStudioLazyReelCreativeBriefForOwnerProduct } from "./getStudioLazyReelCreativeBriefForOwnerProduct";

export const save = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    researchRunId: v.optional(v.string()),
    title: v.string(),
    identity: studioLazyReelIdentityValidator,
    sourceSnapshotVersion: v.string(),
    briefSnapshot: studioLazyReelJsonSnapshotInputValidator,
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
      label: "Creative brief ID",
      maxLength: 120,
    });
    const researchRunId = args.researchRunId
      ? assertStudioLazyReelBoundedString(args.researchRunId, {
          label: "Research run ID",
          maxLength: 120,
        })
      : undefined;
    const title = assertStudioLazyReelBoundedString(args.title, {
      label: "Creative brief title",
      maxLength: 160,
    });
    const sourceSnapshotVersion = assertStudioLazyReelBoundedString(
      args.sourceSnapshotVersion,
      { label: "Source snapshot version", maxLength: 80 },
    );
    const briefSnapshot = normalizeStudioLazyReelJsonSnapshot(
      args.briefSnapshot,
      { label: "Creative brief", maxBytes: 131_072 },
    );
    const existing = await getStudioLazyReelCreativeBriefForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );

    if (existing) {
      const isMatchingRetry =
        existing.researchRunId === researchRunId &&
        existing.title === title &&
        existing.identity.kind === args.identity.kind &&
        existing.identity.key === args.identity.key &&
        existing.sourceSnapshotVersion === sourceSnapshotVersion &&
        existing.briefSnapshot.schemaVersion === briefSnapshot.schemaVersion &&
        existing.briefSnapshot.payloadJson === briefSnapshot.payloadJson;

      if (!isMatchingRetry) {
        throw new Error("Creative brief ID is already in use.");
      }

      return { created: false, brief: existing };
    }

    if (researchRunId) {
      const run = await getStudioLazyReelResearchRunForOwnerProduct(
        ctx,
        ownerId,
        productId,
        researchRunId,
      );

      if (
        !run ||
        run.status !== "completed" ||
        run.identity.kind !== args.identity.kind ||
        run.identity.key !== args.identity.key ||
        run.sourceSnapshotVersion !== sourceSnapshotVersion
      ) {
        throw new Error("Completed research run not found for this Product.");
      }
    }

    await consumeStudioLazyReelRecordWriteRateLimits(ctx, ownerId);

    const now = new Date().toISOString();
    const documentId = await ctx.db.insert("studioLazyReelCreativeBriefs", {
      ownerId,
      id,
      productId,
      researchRunId,
      title,
      identity: args.identity,
      status: "active",
      approvalState: "draft",
      recordVersion: 1,
      sourceSnapshotVersion,
      briefSnapshot,
      createdAt: now,
      updatedAt: now,
      approvalUpdatedAt: now,
    });
    const brief = await ctx.db.get(documentId);

    if (!brief) {
      throw new Error("Creative brief could not be read after creation.");
    }

    return { created: true, brief };
  },
});
