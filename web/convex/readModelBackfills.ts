import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { mutation } from "./_generated/server";
import { upsertBlogPostCardBySlug } from "./blogPostCards/upsertBlogPostCardBySlug";
import { upsertAutomationRunSummary } from "./upsertAutomationRunSummary";
import { upsertAutomationTaskSummary } from "./upsertAutomationTaskSummary";
import { upsertCliprJobSummary } from "./upsertCliprJobSummary";
import { upsertProductCard } from "./upsertProductCard";
import { syncPexelsPackSummary } from "./syncPexelsPackSummary";
import { upsertStitchCard } from "./upsertStitchCard";
import { upsertSwipeCard } from "./upsertSwipeCard";
import { upsertSwiprBackgroundCard } from "./upsertSwiprBackgroundCard";
import { upsertVideoClipCard } from "./upsertVideoClipCard";
import { upsertWorkerJobSummary } from "./upsertWorkerJobSummary";
import { normalizeSwiprLibraryQueryKey } from "../lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export const backfillBlogPostCards = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("blogPosts").paginate(paginationOpts);

    for (const post of page.page) {
      await upsertBlogPostCardBySlug(ctx, post);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillVideoClipCards = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("videoClips").paginate(paginationOpts);

    for (const clip of page.page) {
      await upsertVideoClipCard(ctx, clip);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillStitchCards = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("stitches").paginate(paginationOpts);

    for (const stitch of page.page) {
      await upsertStitchCard(ctx, stitch);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillSwipeCards = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("swipes").paginate(paginationOpts);

    for (const swipe of page.page) {
      await upsertSwipeCard(ctx, swipe);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillSwiprBackgroundCards = mutation({
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
      await upsertSwiprBackgroundCard(ctx, background);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillPexelsPackSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db
      .query("swiprBackgroundCards")
      .withIndex("by_source_created", (q) => q.eq("source", "pexels"))
      .paginate(paginationOpts);
    const libraryQueryKeys = new Set(
      page.page
        .map(
          (background) =>
            background.libraryQueryKey ??
            normalizeSwiprLibraryQueryKey(background.libraryQuery),
        )
        .filter((key): key is string => Boolean(key)),
    );

    for (const libraryQueryKey of libraryQueryKeys) {
      await syncPexelsPackSummary(ctx, libraryQueryKey);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
      summariesSynced: libraryQueryKeys.size,
    };
  },
});

export const backfillProductCards = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("products").paginate(paginationOpts);

    for (const product of page.page) {
      await upsertProductCard(ctx, product);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillCliprJobSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("cliprJobs").paginate(paginationOpts);

    for (const job of page.page) {
      await upsertCliprJobSummary(ctx, job);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillProviderWorkerJobSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("providerJobs").paginate(paginationOpts);

    for (const job of page.page) {
      await upsertWorkerJobSummary(ctx, "provider", job);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillMediaWorkerJobSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("mediaJobs").paginate(paginationOpts);

    for (const job of page.page) {
      await upsertWorkerJobSummary(ctx, "media", job);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillAutomationRunSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("automationRuns").paginate(paginationOpts);

    for (const run of page.page) {
      await upsertAutomationRunSummary(ctx, run);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});

export const backfillAutomationTaskSummaries = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    const page = await ctx.db.query("automationTasks").paginate(paginationOpts);

    for (const task of page.page) {
      await upsertAutomationTaskSummary(ctx, task);
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      processed: page.page.length,
    };
  },
});
