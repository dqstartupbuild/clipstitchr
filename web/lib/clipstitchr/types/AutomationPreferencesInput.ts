import type { AutomationStitchrColorChoice } from "./AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "./AutomationStitchrTextStyleChoice";
import type { AutomationTool } from "./AutomationTool";
import type { CliprGenerationMode } from "./CliprGenerationMode";

export type AutomationCliprGenerationMode = Exclude<
  CliprGenerationMode,
  "demo"
>;

export type AutomationPreferencesInput = {
  enabled: boolean;
  enabledTools: AutomationTool[];
  cliprGenerationMode: AutomationCliprGenerationMode;
  stitchrTextStyleChoice: AutomationStitchrTextStyleChoice;
  stitchrTextColorChoice: AutomationStitchrColorChoice;
  stitchrTextBackgroundColorChoice: AutomationStitchrColorChoice;
  productSelectionMode: "all" | "selected";
  selectedProductIds: string[];
  avatarSelectionMode: "all" | "selected";
  selectedAvatarIds: string[];
};
