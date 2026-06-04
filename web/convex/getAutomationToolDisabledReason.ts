import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import type { AutomationTool } from "../lib/clipstitchr/types/AutomationTool";
import type { MutationCtx } from "./_generated/server";

const automationToolLabels = {
  "avatar-photo": "Avatar photo",
  clipr: "Clipr",
  stitchr: "Stitchr",
  swapr: "Swapr",
  swipr: "Swipr",
} satisfies Record<AutomationTool, string>;

export async function getAutomationToolDisabledReason(
  ctx: MutationCtx,
  ownerId: string,
  tool: AutomationTool,
) {
  const label = automationToolLabels[tool];

  if (!getIsAutomationToolEnabled(tool)) {
    return `${label} automation is disabled by the code flag.`;
  }

  const preferences = await ctx.db
    .query("automationPreferences")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .unique();

  if (!preferences?.enabled || !preferences.enabledTools.includes(tool)) {
    return `${label} automation is disabled.`;
  }

  return null;
}
