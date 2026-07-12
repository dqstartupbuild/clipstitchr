import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { hookLabCreativeBeatValidator } from "../validators/hookLabCreativeBeat";
import { hookLabTextBlueprintValidator } from "../validators/hookLabTextBlueprint";
import { r2ObjectValidator } from "../validators/r2Object";
import { createHookLabIdeaSearchText } from "./createHookLabIdeaSearchText";

export const completeAnalysisFromProvider = mutation({
  args: {
    analysisModel: v.string(),
    analysisVersion: v.string(),
    attributionName: v.optional(v.string()),
    attributionUrl: v.optional(v.string()),
    canonicalUrl: v.optional(v.string()),
    creativeBeat: hookLabCreativeBeatValidator,
    id: v.string(),
    name: v.optional(v.string()),
    originalText: v.optional(v.string()),
    ownerId: v.string(),
    promptVersion: v.string(),
    providerDatasetId: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    providerRunId: v.optional(v.string()),
    secret: v.string(),
    sourceCreatedAt: v.optional(v.string()),
    sourcePostId: v.optional(v.string()),
    textBlueprint: hookLabTextBlueprintValidator,
    thumbnailObject: v.optional(r2ObjectValidator),
    updatedAt: v.string(),
    whatToRepeat: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!idea) {
      throw new Error("Idea not found.");
    }

    const name =
      args.name?.trim().replace(/\s+/g, " ").slice(0, 120) || idea.name;
    const originalText =
      args.originalText?.trim().replace(/\s+/g, " ").slice(0, 2000) ||
      idea.originalText;
    const whatToRepeat = args.whatToRepeat
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 500);

    await ctx.db.patch(idea._id, {
      analysisModel: args.analysisModel.slice(0, 180),
      analysisVersion: args.analysisVersion.slice(0, 80),
      attributionName: args.attributionName?.slice(0, 180),
      attributionUrl: args.attributionUrl?.slice(0, 2048),
      canonicalUrl: args.canonicalUrl?.slice(0, 2048) ?? idea.canonicalUrl,
      creativeBeat: args.creativeBeat,
      failureCode: undefined,
      failureMessage: undefined,
      name,
      originalText,
      promptVersion: args.promptVersion.slice(0, 80),
      providerDatasetId: args.providerDatasetId?.slice(0, 180),
      providerPredictionId: args.providerPredictionId?.slice(0, 180),
      providerRunId: args.providerRunId?.slice(0, 180),
      searchText: createHookLabIdeaSearchText([
        name,
        originalText,
        whatToRepeat,
        args.attributionName,
        args.textBlueprint.reusablePattern,
      ]),
      sourceCreatedAt: args.sourceCreatedAt,
      sourcePostId: args.sourcePostId?.slice(0, 180),
      status: idea.archivedAt ? "archived" : "ready",
      textBlueprint: args.textBlueprint,
      thumbnailObject: args.thumbnailObject,
      updatedAt: args.updatedAt,
      whatToRepeat,
    });

    return idea.id;
  },
});
