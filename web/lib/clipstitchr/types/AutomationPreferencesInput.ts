import type { AutomationStitchrColorChoice } from "./AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "./AutomationStitchrTextStyleChoice";
import type { AutomationGenerationCount } from "./AutomationGenerationCount";
import type { AutomationTool } from "./AutomationTool";
import type { CliprGenerationMode } from "./CliprGenerationMode";
import type { SwiprCallToActionStyle } from "./SwiprCallToActionStyle";

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
  swiprGenerationCount: AutomationGenerationCount;
  swiprCallToActionStyle: SwiprCallToActionStyle;
  swiprCreativeContext: string;
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
