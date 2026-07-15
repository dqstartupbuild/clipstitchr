import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { rateLimiter } from "../rateLimiter";
import { courseKeyValidator } from "../validators/courseKey";
import { courseProgressNoteMaxLength } from "../../lib/clipstitchr/tools/courses/courseProgressNoteMaxLength";
import { getCourseItem } from "../../lib/clipstitchr/tools/courses/getCourseItem";
import { getCourseWorkspaceAccess } from "./getCourseWorkspaceAccess";

const digestPattern = /^[a-f0-9]{64}$/;

export const updateCourseProgressItem = mutation({
  args: {
    clientKey: v.string(),
    completed: v.boolean(),
    courseKey: courseKeyValidator,
    itemId: v.string(),
    note: v.string(),
    secret: v.string(),
    sessionTokenHash: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);
    const courseItem = getCourseItem(args.courseKey, args.itemId);

    if (
      !digestPattern.test(args.clientKey) ||
      !digestPattern.test(args.sessionTokenHash) ||
      !Number.isFinite(args.updatedAt) ||
      !courseItem ||
      args.note.length > courseProgressNoteMaxLength
    ) {
      throw new Error("Invalid course progress update.");
    }

    await rateLimiter.limit(ctx, "courseProgressWriteBySession", {
      key: args.sessionTokenHash,
      throws: true,
    });
    await rateLimiter.limit(ctx, "courseProgressWriteByClient", {
      key: args.clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "courseProgressWriteGlobal", {
      throws: true,
    });

    const access = await getCourseWorkspaceAccess(ctx, {
      accessedAt: args.updatedAt,
      courseKey: args.courseKey,
      tokenHash: args.sessionTokenHash,
    });

    if (
      !access?.entitlement ||
      courseItem.sectionIndex >= access.releasedSectionCount
    ) {
      return { accepted: true as const, saved: false as const };
    }

    const existing = await ctx.db
      .query("courseProgressItems")
      .withIndex("by_entitlement_item", (query) =>
        query
          .eq("entitlementId", access.entitlement!._id)
          .eq("itemId", args.itemId),
      )
      .unique();
    const progress = {
      completed: args.completed,
      note: args.note.trim(),
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, progress);
    } else {
      await ctx.db.insert("courseProgressItems", {
        entitlementId: access.entitlement._id,
        itemId: args.itemId,
        ...progress,
      });
    }

    return { accepted: true as const, saved: true as const };
  },
});
