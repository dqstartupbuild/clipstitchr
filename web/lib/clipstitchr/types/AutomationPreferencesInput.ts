import type { AutomationStitchrColorChoice } from "./AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "./AutomationStitchrTextStyleChoice";
import type { AutomationGenerationCount } from "./AutomationGenerationCount";
import type { AutomationStitchrTemplateAllocation } from "./AutomationStitchrTemplateAllocation";
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
  productId?: string;
  stitchrGenerationCount: AutomationGenerationCount;
  stitchrTextStyleChoice: AutomationStitchrTextStyleChoice;
  stitchrTextColorChoice: AutomationStitchrColorChoice;
  stitchrTextBackgroundColorChoice: AutomationStitchrColorChoice;
  stitchrTextStrokeColorChoice: AutomationStitchrColorChoice;
  stitchrTemplateAllocations: AutomationStitchrTemplateAllocation[];
  swiprGenerationCount: AutomationGenerationCount;
  swiprSelectedLibraryPackNames: string[];
  swiprTextStyleChoice: AutomationStitchrTextStyleChoice;
  swiprTextColorChoice: AutomationStitchrColorChoice;
  swiprTextBackgroundColorChoice: AutomationStitchrColorChoice;
  swiprTextStrokeColorChoice: AutomationStitchrColorChoice;
  productSelectionMode: "all" | "selected";
  selectedProductIds: string[];
  avatarSelectionMode: "all" | "selected";
  selectedAvatarIds: string[];
};
