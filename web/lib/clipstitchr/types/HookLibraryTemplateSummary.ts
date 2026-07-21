import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export type HookLibraryTemplateSummary = {
  bestFor: string[];
  categoryKey: string;
  categoryName: string;
  emotionalTrigger: string;
  id: string;
  purposes: CliprTextPurpose[];
  requiredVariables: string[];
  riskLevel: CliprHookRiskLevel;
  template: string;
};
