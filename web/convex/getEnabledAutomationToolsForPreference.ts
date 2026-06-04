import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import type { AutomationTool } from "../lib/clipstitchr/types/AutomationTool";

type AutomationToolPreference = {
  enabled: boolean;
  enabledTools: AutomationTool[];
};

export function getEnabledAutomationToolsForPreference(
  preference: AutomationToolPreference | null | undefined,
) {
  if (!preference?.enabled) {
    return [];
  }

  return Array.from(new Set(preference.enabledTools)).filter(
    getIsAutomationToolEnabled,
  );
}
