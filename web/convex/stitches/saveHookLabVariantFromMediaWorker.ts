import { v } from "convex/values";
import { stitchCounts, stitchProductCounts } from "../aggregateCounts";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { upsertStitchCard } from "../upsertStitchCard";
import { quickEditSuggestionsValidator } from "../validators/quickEditSuggestions";
import { stitchMusicMetadataValidator } from "../validators/stitchMusicMetadata";
import { stitchrModeValidator } from "../validators/stitchrMode";
import { textOverlayValidator } from "../validators/textOverlay";
import { videoPlaybackRateValidator } from "../validators/videoPlaybackRate";
import { videoTrimRangeValidator } from "../validators/videoTrimRange";
import { mutation } from "../_generated/server";

export const saveHookLabVariantFromMediaWorker = mutation({
  args: {
    createdAt: v.string(),
    demoClipId: v.string(),
    demoClipName: v.string(),
    demoPlaybackRate: videoPlaybackRateValidator,
    demoQuickEdit: v.optional(quickEditSuggestionsValidator),
    demoTrimRange: videoTrimRangeValidator,
    duration: v.number(),
    height: v.number(),
    hookLabIdeaId: v.string(),
    hookLabIdeaUseId: v.string(),
    hookLabIdeaVariantId: v.string(),
    hookLabIdeaVariantIndex: v.number(),
    id: v.string(),
    includeDemoAudio: v.boolean(),
    includeUgcAudio: v.boolean(),
    mode: stitchrModeValidator,
    music: v.optional(stitchMusicMetadataValidator),
    name: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    socialCaption: v.optional(v.string()),
    textOverlay: textOverlayValidator,
    ugcClipId: v.string(),
    ugcClipName: v.string(),
    ugcPlaybackRate: videoPlaybackRateValidator,
    ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
    ugcTrimRange: videoTrimRangeValidator,
    width: v.number(),
  },
  handler: async (ctx, args) => {
    assertMediaWorkerSecret(args.secret);
    const [variant, ugcClip, demoClip] = await Promise.all([
      ctx.db
        .query("hookLabIdeaVariants")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.hookLabIdeaVariantId),
        )
        .unique(),
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.ugcClipId),
        )
        .unique(),
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.demoClipId),
        )
        .unique(),
    ]);

    if (
      !variant ||
      variant.ideaId !== args.hookLabIdeaId ||
      variant.useId !== args.hookLabIdeaUseId ||
      variant.variantIndex !== args.hookLabIdeaVariantIndex
    ) {
      throw new Error("Hook Lab version lineage does not match.");
    }
    if (!ugcClip || !demoClip || demoClip.clipType !== "demo") {
      throw new Error("Hook Lab Stitch sources were not found.");
    }

    const existing = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();
    const stitchFields = {
      ownerId: args.ownerId,
      id: args.id,
      productId: variant.productId,
      mode: args.mode,
      name: args.name.trim().slice(0, 160),
      ugcClipId: args.ugcClipId,
      demoClipId: args.demoClipId,
      ugcClipName: args.ugcClipName,
      demoClipName: args.demoClipName,
      ugcTrimRange: args.ugcTrimRange,
      demoTrimRange: args.demoTrimRange,
      demoQuickEdit: args.demoQuickEdit,
      ugcQuickEdit: args.ugcQuickEdit,
      width: args.width,
      height: args.height,
      duration: args.duration,
      includeDemoAudio: args.includeDemoAudio,
      includeUgcAudio: args.includeUgcAudio,
      demoPlaybackRate: args.demoPlaybackRate,
      ugcPlaybackRate: args.ugcPlaybackRate,
      music: args.music,
      textOverlay: args.textOverlay,
      socialCaption: args.socialCaption,
      hookLabIdeaId: args.hookLabIdeaId,
      hookLabIdeaUseId: args.hookLabIdeaUseId,
      hookLabIdeaVariantIndex: args.hookLabIdeaVariantIndex,
      createdAt: args.createdAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, stitchFields);
      const updated = await ctx.db.get(existing._id);

      if (updated) {
        await Promise.all([
          stitchCounts.replaceOrInsert(ctx, existing, updated),
          stitchProductCounts.replaceOrInsert(ctx, existing, updated),
          upsertStitchCard(ctx, updated),
        ]);
      }

      return args.id;
    }

    const documentId = await ctx.db.insert("stitches", stitchFields);
    const inserted = await ctx.db.get(documentId);

    if (inserted) {
      await Promise.all([
        stitchCounts.insertIfDoesNotExist(ctx, inserted),
        stitchProductCounts.insertIfDoesNotExist(ctx, inserted),
        upsertStitchCard(ctx, inserted),
      ]);
    }

    return args.id;
  },
});
