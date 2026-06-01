import type { AutomationTool } from "../types/AutomationTool";

export const automationToolFeatureFlags = {
  stitchr: true,
  swapr: false,
  clipr: true,
  "avatar-photo": true,
  swipr: true,
} satisfies Record<AutomationTool, boolean>;

export function getIsAutomationToolEnabled(tool: AutomationTool) {
  return automationToolFeatureFlags[tool];
}
