import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { rateLimiter } from "../rateLimiter";
import { courseKeyValidator } from "../validators/courseKey";
import { getCourseWorkspaceAccess } from "./getCourseWorkspaceAccess";

const digestPattern = /^[a-f0-9]{64}$/;

export const resetCourseProgress = mutation({
  args: {
    courseKey: courseKeyValidator,
    resetAt: v.number(),
    secret: v.string(),
    sessionTokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    if (
      !digestPattern.test(args.sessionTokenHash) ||
      !Number.isFinite(args.resetAt)
    ) {
      return { accepted: true as const };
    }

    await rateLimiter.limit(ctx, "courseProgressResetBySession", {
      key: args.sessionTokenHash,
      throws: true,
    });
    await rateLimiter.limit(ctx, "courseProgressResetGlobal", {
      throws: true,
    });

    const access = await getCourseWorkspaceAccess(ctx, {
      accessedAt: args.resetAt,
      courseKey: args.courseKey,
      tokenHash: args.sessionTokenHash,
    });

    if (!access?.entitlement) return { accepted: true as const };

    const progressItems = await ctx.db
      .query("courseProgressItems")
      .withIndex("by_entitlement_updated", (query) =>
        query.eq("entitlementId", access.entitlement!._id),
      )
      .collect();

    for (const item of progressItems) await ctx.db.delete(item._id);

    return { accepted: true as const };
  },
});
