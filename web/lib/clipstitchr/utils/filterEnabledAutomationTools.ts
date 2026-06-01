import { isSwaprAutomationEnabled } from "@/lib/clipstitchr/constants/isSwaprAutomationEnabled";
import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";

export function filterEnabledAutomationTools(tools: AutomationTool[]) {
  return Array.from(new Set(tools)).filter(
    (tool) => tool !== "swapr" || isSwaprAutomationEnabled,
  );
}
