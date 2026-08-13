import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRunWriteRateLimits } from "../studioLazyReel/consumeStudioLazyReelRunWriteRateLimits";
import { normalizeStudioLazyReelJsonSnapshot } from "../studioLazyReel/normalizeStudioLazyReelJsonSnapshot";
import { studioLazyReelJsonSnapshotInputValidator } from "../validators/studioLazyReelJsonSnapshotInput";
import { studioLazyReelRunFailureInputValidator } from "../validators/studioLazyReelRunFailureInput";
import { getStudioLazyReelResearchRunForOwnerProduct } from "./getStudioLazyReelResearchRunForOwnerProduct";

export const fail = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    failure: studioLazyReelRunFailureInputValidator,
    artifactSummary: v.optional(studioLazyReelJsonSnapshotInputValidator),
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
    const failure = {
      code: assertStudioLazyReelBoundedString(args.failure.code, {
        label: "Failure code",
        maxLength: 80,
      }),
      message: assertStudioLazyReelBoundedString(args.failure.message, {
        label: "Failure message",
        maxLength: 1_000,
      }),
      retryable: args.failure.retryable,
      detailsSnapshot: args.failure.detailsSnapshot
        ? normalizeStudioLazyReelJsonSnapshot(args.failure.detailsSnapshot, {
            label: "Failure details snapshot",
            maxBytes: 32_768,
          })
        : undefined,
    };
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
        existing.status === "failed" &&
        existing.failure?.code === failure.code &&
        existing.failure?.message === failure.message &&
        existing.failure?.retryable === failure.retryable &&
        existing.failure?.detailsSnapshot?.schemaVersion ===
          failure.detailsSnapshot?.schemaVersion &&
        existing.failure?.detailsSnapshot?.payloadJson ===
          failure.detailsSnapshot?.payloadJson &&
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
      status: "failed" as const,
      outcome: undefined,
      resultSnapshot: undefined,
      artifactSummary,
      failure,
      failedAt: now,
      completedAt: undefined,
      updatedAt: now,
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
