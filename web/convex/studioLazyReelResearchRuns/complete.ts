import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRunWriteRateLimits } from "../studioLazyReel/consumeStudioLazyReelRunWriteRateLimits";
import { normalizeStudioLazyReelJsonSnapshot } from "../studioLazyReel/normalizeStudioLazyReelJsonSnapshot";
import { studioLazyReelJsonSnapshotInputValidator } from "../validators/studioLazyReelJsonSnapshotInput";
import { studioLazyReelRunOutcomeValidator } from "../validators/studioLazyReelRunOutcome";
import { getStudioLazyReelResearchRunForOwnerProduct } from "./getStudioLazyReelResearchRunForOwnerProduct";

export const complete = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    resultSnapshot: studioLazyReelJsonSnapshotInputValidator,
    artifactSummary: v.optional(studioLazyReelJsonSnapshotInputValidator),
    outcome: studioLazyReelRunOutcomeValidator,
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
    const resultSnapshot = normalizeStudioLazyReelJsonSnapshot(
      args.resultSnapshot,
      { label: "Research result snapshot", maxBytes: 524_288 },
    );
    const artifactSummary = args.artifactSummary
      ? normalizeStudioLazyReelJsonSnapshot(args.artifactSummary, {
          label: "Research artifact summary",
          maxBytes: 65_536,
        })
      : undefined;
    const existing = await getStudioLazyReelResearchRunForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );

    if (!existing) {
      throw new Error("Research run not found.");
    }

    if (existing.status !== "pending") {
      const isMatchingRetry =
        existing.status === "completed" &&
        existing.outcome === args.outcome &&
        existing.resultSnapshot?.schemaVersion === resultSnapshot.schemaVersion &&
        existing.resultSnapshot?.payloadJson === resultSnapshot.payloadJson &&
        existing.artifactSummary?.schemaVersion === artifactSummary?.schemaVersion &&
        existing.artifactSummary?.payloadJson === artifactSummary?.payloadJson;

      if (isMatchingRetry) {
        return existing;
      }

      throw new Error("Research run is already terminal.");
    }

    await consumeStudioLazyReelRunWriteRateLimits(ctx, ownerId);

    const now = new Date().toISOString();
    const fields = {
      status: "completed" as const,
      outcome: args.outcome,
      resultSnapshot,
      artifactSummary,
      failure: undefined,
      completedAt: now,
      failedAt: undefined,
      updatedAt: now,
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
