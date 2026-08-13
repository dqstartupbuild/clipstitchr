import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRecordWriteRateLimits } from "../studioLazyReel/consumeStudioLazyReelRecordWriteRateLimits";
import { getStudioLazyReelSavedReportForOwnerProduct } from "./getStudioLazyReelSavedReportForOwnerProduct";

export const archive = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
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
      label: "Saved report ID",
      maxLength: 120,
    });
    const existing = await getStudioLazyReelSavedReportForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );

    if (!existing) {
      throw new Error("Saved report not found.");
    }

    if (existing.status === "archived") {
      return existing;
    }

    await consumeStudioLazyReelRecordWriteRateLimits(ctx, ownerId);

    const now = new Date().toISOString();
    const fields = {
      status: "archived" as const,
      archivedAt: now,
      updatedAt: now,
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
