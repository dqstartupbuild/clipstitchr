import type { AutomationTool } from "../types/AutomationTool";

export const coreAutomationTools = [
  "stitchr",
  "swapr",
  "clipr",
  "avatar-photo",
  "swipr",
] as const satisfies readonly AutomationTool[];
