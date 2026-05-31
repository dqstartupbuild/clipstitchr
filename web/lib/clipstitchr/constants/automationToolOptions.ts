import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";

export const automationToolOptions: Array<{
  id: AutomationTool;
  label: string;
}> = [
  { id: "stitchr", label: "Stitchr" },
  { id: "swapr", label: "Swapr" },
  { id: "clipr", label: "Clipr" },
  { id: "avatar-photo", label: "Avatar photos" },
  { id: "swipr", label: "Swipr" },
];
