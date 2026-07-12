import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { recalculateHookLabIdeaUse } from "./recalculateHookLabIdeaUse";

export const failDispatch = mutation({
  args: {
    id: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, secret, updatedAt }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!variant || variant.status !== "queued") {
      return null;
    }

    await ctx.db.patch(variant._id, {
      failureCode: "job_dispatch_failed",
      failureMessage:
        "We could not start this version. Your other versions will keep going.",
      status: "failed",
      updatedAt,
    });
    await recalculateHookLabIdeaUse({
      ctx,
      ownerId,
      updatedAt,
      useId: variant.useId,
    });

    return variant.id;
  },
});
