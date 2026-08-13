import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRecordWriteRateLimits } from "../studioLazyReel/consumeStudioLazyReelRecordWriteRateLimits";
import { studioLazyReelBriefApprovalStateValidator } from "../validators/studioLazyReelBriefApprovalState";
import { getStudioLazyReelCreativeBriefForOwnerProduct } from "./getStudioLazyReelCreativeBriefForOwnerProduct";

export const updateApprovalState = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    approvalState: studioLazyReelBriefApprovalStateValidator,
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
    const existing = await getStudioLazyReelCreativeBriefForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );

    if (!existing || existing.status !== "active") {
      throw new Error("Active creative brief not found.");
    }

    if (existing.approvalState === args.approvalState) {
      return existing;
    }

    await consumeStudioLazyReelRecordWriteRateLimits(ctx, ownerId);

    const now = new Date().toISOString();
    const fields = {
      approvalState: args.approvalState,
      approvedAt: args.approvalState === "approved" ? now : undefined,
      handoffDestination: undefined,
      approvalUpdatedAt: now,
      updatedAt: now,
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
