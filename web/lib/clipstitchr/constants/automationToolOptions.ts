import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
import { isSwaprAutomationEnabled } from "@/lib/clipstitchr/constants/isSwaprAutomationEnabled";

export const automationToolOptions: Array<{
  id: AutomationTool;
  label: string;
}> = [
  { id: "stitchr", label: "Stitchr" },
  ...(isSwaprAutomationEnabled
    ? ([{ id: "swapr", label: "Swapr" }] satisfies Array<{
        id: AutomationTool;
        label: string;
      }>)
    : []),
  { id: "clipr", label: "Clipr" },
  { id: "avatar-photo", label: "Avatar photos" },
  { id: "swipr", label: "Swipr" },
];
