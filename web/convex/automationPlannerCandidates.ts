import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { query } from "./_generated/server";
import { getEnabledAutomationToolsForPreference } from "./getEnabledAutomationToolsForPreference";

export const listEnabled = query({
  args: {
    secret: v.string(),
    cursorOwnerId: v.optional(v.string()),
    limit: v.number(),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, { secret, cursorOwnerId, limit, ownerId }) => {
    assertAutomationWorkerSecret(secret);

    const cappedLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const preferences = ownerId
      ? await ctx.db
          .query("automationPreferences")
          .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
          .collect()
      : await ctx.db.query("automationPreferences").collect();
    const enabledPreferences = preferences
      .map((preference) => ({
        ownerId: preference.ownerId,
        productId: preference.productId,
        enabledTools: getEnabledAutomationToolsForPreference(preference),
      }))
      .filter((preference) => preference.enabledTools.length > 0)
      .filter((preference) =>
        cursorOwnerId ? preference.ownerId > cursorOwnerId : true,
      )
      .sort((a, b) =>
        `${a.ownerId}:${a.productId ?? ""}`.localeCompare(
          `${b.ownerId}:${b.productId ?? ""}`,
        ),
      )
      .slice(0, cappedLimit);

    return {
      preferences: enabledPreferences,
      nextCursorOwnerId:
        enabledPreferences.length === cappedLimit
          ? enabledPreferences[enabledPreferences.length - 1]?.ownerId
          : undefined,
    };
  },
});

export const getEnabledToolsForOwner = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, { secret, ownerId }) => {
    assertAutomationWorkerSecret(secret);

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
    const preference =
      preferences.find((candidate) => !candidate.productId) ?? null;

    return {
      ownerId,
      productId: preference?.productId,
      enabledTools: getEnabledAutomationToolsForPreference(preference),
    };
  },
});
