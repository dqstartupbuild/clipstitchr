import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { mutation } from "./_generated/server";
import { stitchCounts, videoClipCounts } from "./aggregateCounts";
import { getVideoClipLibraryKind } from "./getVideoClipLibraryKind";

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
