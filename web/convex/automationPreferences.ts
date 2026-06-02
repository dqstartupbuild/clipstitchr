import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { rateLimiter } from "./rateLimiter";
import { automationSelectionModeValidator } from "./validators/automationSelectionMode";
import { automationToolValidator } from "./validators/automationTool";
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
        }
      : null;
  },
});

export const save = mutation({
  args: {
    enabled: v.boolean(),
    enabledTools: v.array(automationToolValidator),
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
