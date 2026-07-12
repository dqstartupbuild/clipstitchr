import { v } from "convex/values";
import { videoClipCounts, videoClipProductCounts } from "../aggregateCounts";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { getVideoClipLibraryKind } from "../getVideoClipLibraryKind";
import { upsertVideoClipCard } from "../upsertVideoClipCard";
import { r2ObjectValidator } from "../validators/r2Object";
import { videoTrimRangeValidator } from "../validators/videoTrimRange";
import { mutation } from "../_generated/server";

export const saveHookLabVariantFromMediaWorker = mutation({
  args: {
    aspectRatio: v.number(),
    createdAt: v.string(),
    defaultTrimRange: videoTrimRangeValidator,
    duration: v.number(),
    hasAudio: v.boolean(),
    height: v.number(),
    hookLabIdeaId: v.string(),
    hookLabIdeaUseId: v.string(),
    hookLabIdeaVariantId: v.string(),
    hookLabIdeaVariantIndex: v.number(),
    id: v.string(),
    name: v.string(),
    originalSize: v.number(),
    ownerId: v.string(),
    posterObject: r2ObjectValidator,
    productId: v.string(),
    secret: v.string(),
    size: v.number(),
    sourceMimeType: v.string(),
    updatedAt: v.string(),
    videoObject: r2ObjectValidator,
    width: v.number(),
  },
  handler: async (ctx, args) => {
    assertMediaWorkerSecret(args.secret);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.hookLabIdeaVariantId),
      )
      .unique();

    if (
      !variant ||
      variant.ideaId !== args.hookLabIdeaId ||
      variant.useId !== args.hookLabIdeaUseId ||
      variant.productId !== args.productId ||
      variant.variantIndex !== args.hookLabIdeaVariantIndex
    ) {
      throw new Error("Hook Lab version lineage does not match.");
    }

    const expectedPrefix = `users/${encodeURIComponent(args.ownerId)}/`;

    if (
      !args.videoObject.key.startsWith(expectedPrefix) ||
      !args.posterObject.key.startsWith(expectedPrefix)
    ) {
      throw new Error("Hook Lab media does not belong to this account.");
    }

    const existing = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();
    const clipFields = {
      ownerId: args.ownerId,
      id: args.id,
      name: args.name.trim().slice(0, 160),
      tags: ["ugc", "hook-lab"],
      productId: args.productId,
      originalName: `${args.name.trim().slice(0, 140) || "Hook Lab opening"}.mp4`,
      clipType: "ugc" as const,
      libraryKind: getVideoClipLibraryKind({ clipType: "ugc" }),
      videoObject: args.videoObject,
      posterObject: args.posterObject,
      posterVersion: 2,
      mimeType: args.videoObject.contentType,
      sourceMimeType: args.sourceMimeType,
      size: args.size,
      originalSize: args.originalSize,
      width: args.width,
      height: args.height,
      aspectRatio: args.aspectRatio,
      duration: args.duration,
      defaultTrimRange: args.defaultTrimRange,
      hasAudio: args.hasAudio,
      hookLabIdeaId: args.hookLabIdeaId,
      hookLabIdeaUseId: args.hookLabIdeaUseId,
      hookLabIdeaVariantIndex: args.hookLabIdeaVariantIndex,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, clipFields);
      const updated = await ctx.db.get(existing._id);

      if (updated) {
        await Promise.all([
          videoClipCounts.replaceOrInsert(ctx, existing, updated),
          videoClipProductCounts.replaceOrInsert(ctx, existing, updated),
          upsertVideoClipCard(ctx, updated),
        ]);
      }

      return args.id;
    }

    const documentId = await ctx.db.insert("videoClips", clipFields);
    const inserted = await ctx.db.get(documentId);

    if (inserted) {
      await Promise.all([
        videoClipCounts.insertIfDoesNotExist(ctx, inserted),
        videoClipProductCounts.insertIfDoesNotExist(ctx, inserted),
        upsertVideoClipCard(ctx, inserted),
      ]);
    }

    return args.id;
  },
});
