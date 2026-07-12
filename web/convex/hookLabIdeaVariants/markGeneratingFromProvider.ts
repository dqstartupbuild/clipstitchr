import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { hookLabTextDecisionValidator } from "../validators/hookLabTextDecision";
import { getHookLabOverlappingSiblingHook } from "../../lib/clipstitchr/server/hookLab/getHookLabOverlappingSiblingHook";

export const markGeneratingFromProvider = mutation({
  args: {
    generatedCaption: v.string(),
    generatedHook: v.string(),
    id: v.string(),
    ownerId: v.string(),
    providerPredictionIds: v.array(v.string()),
    secret: v.string(),
    textDecision: hookLabTextDecisionValidator,
    textDecisionReason: v.string(),
    updatedAt: v.string(),
    visualPrompt: v.string(),
    visualPromptSummary: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!variant) {
      throw new Error("Idea version not found.");
    }

    if (variant.status === "completed" || variant.status === "failed") {
      throw new Error("Idea version is no longer generating.");
    }

    const siblings = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_use_variant", (index) =>
        index.eq("ownerId", args.ownerId).eq("useId", variant.useId),
      )
      .take(5);
    const siblingHooks = siblings.flatMap((sibling) =>
      sibling.id !== variant.id && sibling.generatedHook
        ? [sibling.generatedHook]
        : [],
    );

    if (
      getHookLabOverlappingSiblingHook({
        candidateText: args.generatedHook,
        siblingHooks,
      })
    ) {
      return {
        accepted: false as const,
        id: variant.id,
        siblingHooks,
      };
    }

    await ctx.db.patch(variant._id, {
      failureCode: undefined,
      failureMessage: undefined,
      generatedCaption: args.generatedCaption.trim().slice(0, 2000),
      generatedHook: args.generatedHook.trim().slice(0, 240),
      providerPredictionIds: Array.from(
        new Set([...variant.providerPredictionIds, ...args.providerPredictionIds]),
      ).slice(0, 12),
      status: "creating_opening",
      textDecision: args.textDecision,
      textDecisionReason: args.textDecisionReason.trim().slice(0, 300),
      updatedAt: args.updatedAt,
      visualPrompt: args.visualPrompt.trim().slice(0, 4000),
      visualPromptSummary: args.visualPromptSummary.trim().slice(0, 1000),
    });

    const use = await ctx.db
      .query("hookLabIdeaUses")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", variant.useId),
      )
      .unique();

    if (use && use.status === "queued") {
      await ctx.db.patch(use._id, {
        status: "generating",
        updatedAt: args.updatedAt,
      });
    }

    return {
      accepted: true as const,
      id: variant.id,
      siblingHooks,
    };
  },
});
