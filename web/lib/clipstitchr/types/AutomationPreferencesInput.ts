import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

export type AutomationPreferencesInput = {
  enabled: boolean;
  enabledTools: AutomationTool[];
  cliprGenerationMode: CliprGenerationMode;
  stitchrTextStyleChoice: AutomationStitchrTextStyleChoice;
  stitchrTextColorChoice: AutomationStitchrColorChoice;
  stitchrTextBackgroundColorChoice: AutomationStitchrColorChoice;
  productSelectionMode: "all" | "selected";
  selectedProductIds: string[];
  avatarSelectionMode: "all" | "selected";
  selectedAvatarIds: string[];
};
