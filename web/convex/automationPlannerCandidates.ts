import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { query } from "./_generated/server";
import { getEnabledAutomationToolsForPreference } from "./getEnabledAutomationToolsForPreference";
import { logConvexTransactionMetrics } from "./logConvexTransactionMetrics";

const AUTOMATION_PREFERENCE_GLOBAL_SCAN_LIMIT = 500;
const AUTOMATION_PREFERENCE_OWNER_SCAN_LIMIT = 50;

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
    const globalScanLimit = Math.min(
      AUTOMATION_PREFERENCE_GLOBAL_SCAN_LIMIT,
      Math.max(cappedLimit * 8, cappedLimit),
    );
    const preferences = ownerId
      ? await ctx.db
          .query("automationPreferences")
          .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
          .take(AUTOMATION_PREFERENCE_OWNER_SCAN_LIMIT)
      : await ctx.db
          .query("automationPreferences")
          .withIndex("by_enabled_owner_product", (q) =>
            cursorOwnerId
              ? q.eq("enabled", true).gt("ownerId", cursorOwnerId)
              : q.eq("enabled", true),
          )
          .take(globalScanLimit);
    const enabledPreferences = preferences
      .map((preference) => ({
        ownerId: preference.ownerId,
        productId: preference.productId,
        enabledTools: getEnabledAutomationToolsForPreference(preference),
      }))
      .filter((preference) => preference.enabledTools.length > 0)
      .sort((a, b) =>
        `${a.ownerId}:${a.productId ?? ""}`.localeCompare(
          `${b.ownerId}:${b.productId ?? ""}`,
        ),
      )
      .slice(0, cappedLimit);
    await logConvexTransactionMetrics(
      ctx,
      "automationPlannerCandidates.listEnabled",
    );

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

    const preference = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner_product", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .unique();
    await logConvexTransactionMetrics(
      ctx,
      "automationPlannerCandidates.getEnabledToolsForOwner",
    );

    return {
      ownerId,
      productId: preference?.productId,
      enabledTools: getEnabledAutomationToolsForPreference(preference),
    };
  },
});
