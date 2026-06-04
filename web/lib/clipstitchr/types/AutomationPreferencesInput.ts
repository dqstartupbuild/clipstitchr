import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";

export type AutomationPreferencesInput = {
  enabled: boolean;
  enabledTools: AutomationTool[];
  stitchrTextStyleChoice: AutomationStitchrTextStyleChoice;
  stitchrTextColorChoice: AutomationStitchrColorChoice;
  stitchrTextBackgroundColorChoice: AutomationStitchrColorChoice;
  productSelectionMode: "all" | "selected";
  selectedProductIds: string[];
  avatarSelectionMode: "all" | "selected";
  selectedAvatarIds: string[];
};
