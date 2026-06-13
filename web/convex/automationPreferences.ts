import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { defaultAutomationStitchrColorChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { getAutomationStitchrColorChoice } from "../lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { rateLimiter } from "./rateLimiter";
import { automationSelectionModeValidator } from "./validators/automationSelectionMode";
import { automationStitchrTextStyleChoiceValidator } from "./validators/automationStitchrTextStyleChoice";
import { automationToolValidator } from "./validators/automationTool";
import { automationCliprGenerationModeValidator } from "./validators/automationCliprGenerationMode";
import type { AutomationTool } from "../lib/clipstitchr/types/AutomationTool";

function filterEnabledAutomationTools(tools: AutomationTool[]) {
  return Array.from(new Set(tools)).filter(getIsAutomationToolEnabled);
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    return preferences
      ? {
          ...preferences,
          enabledTools: filterEnabledAutomationTools(preferences.enabledTools),
          cliprGenerationMode:
            preferences.cliprGenerationMode ?? "any",
          stitchrTextStyleChoice: getAutomationStitchrTextStyleChoice(
            preferences.stitchrTextStyleChoice,
          ),
          stitchrTextColorChoice: getAutomationStitchrColorChoice(
            preferences.stitchrTextColorChoice,
          ),
          stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            preferences.stitchrTextBackgroundColorChoice,
          ),
        }
      : null;
  },
});

export const save = mutation({
  args: {
    enabled: v.boolean(),
    enabledTools: v.array(automationToolValidator),
    cliprGenerationMode: v.optional(automationCliprGenerationModeValidator),
    stitchrTextStyleChoice: v.optional(
      automationStitchrTextStyleChoiceValidator,
    ),
    stitchrTextColorChoice: v.optional(v.string()),
    stitchrTextBackgroundColorChoice: v.optional(v.string()),
    productSelectionMode: automationSelectionModeValidator,
    selectedProductIds: v.array(v.string()),
    avatarSelectionMode: automationSelectionModeValidator,
    selectedAvatarIds: v.array(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existing = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    await rateLimiter.limit(
      ctx,
      existing ? "convexMetadataUpdate" : "convexRecordSave",
      {
        key: ownerId,
        throws: true,
      },
    );

    const productIds = Array.from(new Set(args.selectedProductIds));
    const avatarIds = Array.from(new Set(args.selectedAvatarIds));
    const preferences = {
      ownerId,
      enabled: args.enabled,
      enabledTools: filterEnabledAutomationTools(args.enabledTools),
      cliprGenerationMode: args.cliprGenerationMode ?? "any",
      stitchrTextStyleChoice:
        args.stitchrTextStyleChoice ?? defaultAutomationStitchrTextStyleChoice,
      stitchrTextColorChoice: getAutomationStitchrColorChoice(
        args.stitchrTextColorChoice ?? defaultAutomationStitchrColorChoice,
      ),
      stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
        args.stitchrTextBackgroundColorChoice ??
          defaultAutomationStitchrColorChoice,
      ),
      productSelectionMode: args.productSelectionMode,
      selectedProductIds:
        args.productSelectionMode === "selected" ? productIds : [],
      avatarSelectionMode: args.avatarSelectionMode,
      selectedAvatarIds: args.avatarSelectionMode === "selected" ? avatarIds : [],
      preferenceVersion: (existing?.preferenceVersion ?? 0) + 1,
      createdAt: existing?.createdAt ?? args.updatedAt,
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, preferences);
      return existing._id;
    }

    return await ctx.db.insert("automationPreferences", preferences);
  },
});
