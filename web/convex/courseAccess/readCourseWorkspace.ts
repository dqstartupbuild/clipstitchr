import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { rateLimiter } from "../rateLimiter";
import { courseKeyValidator } from "../validators/courseKey";
import { getCourseWorkspaceAccess } from "./getCourseWorkspaceAccess";

const digestPattern = /^[a-f0-9]{64}$/;

export const readCourseWorkspace = mutation({
  args: {
    accessedAt: v.number(),
    courseKey: courseKeyValidator,
    secret: v.string(),
    sessionTokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    if (
      !digestPattern.test(args.sessionTokenHash) ||
      !Number.isFinite(args.accessedAt)
    ) {
      return {
        availableSectionCount: 0,
        hasAccess: false,
        hasSession: false,
        progressItems: [],
      };
    }

    await rateLimiter.limit(ctx, "courseWorkspaceReadBySession", {
      key: args.sessionTokenHash,
      throws: true,
    });
    await rateLimiter.limit(ctx, "courseWorkspaceReadGlobal", {
      throws: true,
    });

    const access = await getCourseWorkspaceAccess(ctx, {
      accessedAt: args.accessedAt,
      courseKey: args.courseKey,
      tokenHash: args.sessionTokenHash,
    });

    if (!access) {
      return {
        availableSectionCount: 0,
        hasAccess: false,
        hasSession: false,
        progressItems: [],
      };
    }

    if (!access.entitlement) {
      return {
        availableSectionCount: 0,
        hasAccess: false,
        hasSession: true,
        progressItems: [],
      };
    }

    const progressItems = await ctx.db
      .query("courseProgressItems")
      .withIndex("by_entitlement_updated", (query) =>
        query.eq("entitlementId", access.entitlement!._id),
      )
      .collect();

    return {
      activatedAt: access.entitlement.activatedAt,
      availableSectionCount: access.releasedSectionCount,
      hasAccess: true,
      hasSession: true,
      progressItems: progressItems.map((item) => ({
        completed: item.completed,
        itemId: item.itemId,
        note: item.note,
        updatedAt: item.updatedAt,
      })),
    };
  },
});
