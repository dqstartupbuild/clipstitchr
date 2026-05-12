import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";

export type CliprHookStyle = {
  styleKey: string;
  styleName: string;
  sourceCategory: string;
  coreIntent: string;
  emotionalTrigger: string;
  bestFor: string[];
  riskLevel: CliprHookRiskLevel;
};
