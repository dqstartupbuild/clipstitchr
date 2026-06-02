import { getIsAutomationToolEnabled } from "@/lib/clipstitchr/constants/automationToolFeatureFlags";
import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";

export function filterEnabledAutomationTools(tools: AutomationTool[]) {
  return Array.from(new Set(tools)).filter(getIsAutomationToolEnabled);
}
