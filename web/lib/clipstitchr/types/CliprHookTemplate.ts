import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";

export type CliprHookTemplate = {
  id: string;
  styleKey: string;
  template: string;
  requiredVariables: string[];
  emotionalTrigger: string;
  bestFor: string[];
  riskLevel: CliprHookRiskLevel;
  active: boolean;
};
