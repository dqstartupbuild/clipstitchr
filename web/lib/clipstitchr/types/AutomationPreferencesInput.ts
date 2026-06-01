import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";

export type AutomationPreferencesInput = {
  enabled: boolean;
  enabledTools: AutomationTool[];
  productSelectionMode: "all" | "selected";
  selectedProductIds: string[];
  avatarSelectionMode: "all" | "selected";
  selectedAvatarIds: string[];
};
