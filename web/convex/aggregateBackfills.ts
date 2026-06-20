import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { mutation } from "./_generated/server";
import {
  stitchCounts,
  stitchProductCounts,
  videoClipCounts,
  videoClipProductCounts,
} from "./aggregateCounts";
import { getVideoClipLibraryKind } from "./getVideoClipLibraryKind";
import { normalizeSwiprLibraryQueryKey } from "../lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export const backfillVideoClipCounts = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("videoClips").paginate(paginationOpts);

    for (const clip of page.page) {
      await videoClipCounts.insertIfDoesNotExist(ctx, clip);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillStitchCounts = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("stitches").paginate(paginationOpts);

    for (const stitch of page.page) {
      await stitchCounts.insertIfDoesNotExist(ctx, stitch);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillVideoClipProductCounts = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("videoClips").paginate(paginationOpts);

    for (const clip of page.page) {
      await videoClipProductCounts.insertIfDoesNotExist(ctx, clip);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillStitchProductCounts = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("stitches").paginate(paginationOpts);

    for (const stitch of page.page) {
      await stitchProductCounts.insertIfDoesNotExist(ctx, stitch);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillVideoClipLibraryKinds = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("videoClips").paginate(paginationOpts);

    for (const clip of page.page) {
      const libraryKind = getVideoClipLibraryKind(clip);

      if (clip.libraryKind !== libraryKind) {
        await ctx.db.patch(clip._id, { libraryKind });
      }
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillSwiprBackgroundLibraryQueryKeys = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db
      .query("swiprBackgrounds")
      .paginate(paginationOpts);

    for (const background of page.page) {
      const libraryQueryKey = background.libraryQuery
        ? normalizeSwiprLibraryQueryKey(background.libraryQuery)
        : undefined;

      if (background.libraryQueryKey !== libraryQueryKey) {
        await ctx.db.patch(background._id, { libraryQueryKey });
      }
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillNotificationSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("notifications").paginate(paginationOpts);
    const ownerIds = Array.from(
      new Set(page.page.map((notification) => notification.ownerId)),
    );

    for (const ownerId of ownerIds) {
      const unreadNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_owner_is_read_created", (q) =>
          q.eq("ownerId", ownerId).eq("isRead", false),
        )
        .take(1000);
      const existingSummary = await ctx.db
        .query("notificationSummaries")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .unique();

      if (existingSummary) {
        if (existingSummary.unreadCount !== unreadNotifications.length) {
          await ctx.db.patch(existingSummary._id, {
            unreadCount: unreadNotifications.length,
            updatedAt: new Date().toISOString(),
          });
        }

        continue;
      }

      await ctx.db.insert("notificationSummaries", {
        ownerId,
        unreadCount: unreadNotifications.length,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});
