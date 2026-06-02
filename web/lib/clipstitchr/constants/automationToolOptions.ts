import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
import { getIsAutomationToolEnabled } from "@/lib/clipstitchr/constants/automationToolFeatureFlags";

const allAutomationToolOptions: Array<{
  id: AutomationTool;
  label: string;
}> = [
  { id: "stitchr", label: "Stitchr" },
  { id: "swapr", label: "Swapr" },
  { id: "clipr", label: "Clipr" },
  { id: "avatar-photo", label: "Avatar photos" },
  { id: "swipr", label: "Swipr" },
];

export const automationToolOptions = allAutomationToolOptions.filter((tool) =>
  getIsAutomationToolEnabled(tool.id),
);
