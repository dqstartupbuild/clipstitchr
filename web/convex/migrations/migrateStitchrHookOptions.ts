import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { syncStitchrHookOptionsFromPlan } from "../stitchrHookOptions/syncStitchrHookOptionsFromPlan";

export const migrateStitchrHookOptions = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);
    const page = await ctx.db
      .query("stitchrHookPlans")
      .paginate({ ...paginationOpts, numItems: Math.min(50, paginationOpts.numItems) });

    for (const plan of page.page) {
      await syncStitchrHookOptionsFromPlan({
        createdAt: plan.createdAt,
        ctx,
        hookOptions: plan.hookOptions,
        ownerId: plan.ownerId,
        planCreatedAt: plan.createdAt,
        planId: plan.id,
        planSource: plan.source,
        productId: plan.productId,
        productName: plan.productName,
        selectedHook: plan.selectedHook,
        stitchId: plan.stitchId,
        updatedAt: plan.updatedAt,
      });
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processedCount: page.page.length,
    };
  },
});
