import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { upsertStitchCard } from "../upsertStitchCard";

export const select = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const option = await ctx.db
      .query("stitchrHookOptions")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!option) {
      throw new Error("Hook not found.");
    }

    const [planOptions, plan] = await Promise.all([
      ctx.db
        .query("stitchrHookOptions")
        .withIndex("by_owner_plan_rank", (index) =>
          index.eq("ownerId", ownerId).eq("planId", option.planId),
        )
        .take(8),
      ctx.db
        .query("stitchrHookPlans")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", option.planId),
        )
        .unique(),
    ]);

    for (const sibling of planOptions) {
      if (sibling.isSelected !== (sibling.id === option.id)) {
        await ctx.db.patch(sibling._id, {
          isSelected: sibling.id === option.id,
          updatedAt,
        });
      }
    }

    if (plan) {
      await ctx.db.patch(plan._id, {
        angle: option.angle,
        feedbackStatus:
          option.reviewState === "saved"
            ? "accepted"
            : option.reviewState === "not_for_me"
              ? "rejected"
              : undefined,
        reason: option.reason,
        selectedHook: option.hook,
        updatedAt,
      });
    }

    const stitchId = option.stitchId ?? plan?.stitchId;
    const stitch = stitchId
      ? await ctx.db
          .query("stitches")
          .withIndex("by_owner_id", (index) =>
            index.eq("ownerId", ownerId).eq("id", stitchId),
          )
          .unique()
      : null;

    if (stitch) {
      const textOverlays = stitch.textOverlays?.length
        ? stitch.textOverlays.map((overlay, index) =>
            index === 0 ? { ...overlay, text: option.hook } : overlay,
          )
        : undefined;
      await ctx.db.patch(stitch._id, {
        ...(stitch.textOverlay
          ? { textOverlay: { ...stitch.textOverlay, text: option.hook } }
          : {}),
        ...(textOverlays ? { textOverlays } : {}),
      });
      const updatedStitch = await ctx.db.get(stitch._id);

      if (updatedStitch) {
        await upsertStitchCard(ctx, updatedStitch);
      }
    }

    return option.id;
  },
});
