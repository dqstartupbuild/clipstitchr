import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";
import type { CliprHookSource } from "@/lib/clipstitchr/types/CliprHookSource";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export type CliprHookTemplate = {
  allowedPurposes: CliprTextPurpose[];
  id: string;
  styleKey: string;
  template: string;
  requiredVariables: string[];
  emotionalTrigger: string;
  bestFor: string[];
  riskLevel: CliprHookRiskLevel;
  source: CliprHookSource;
  active: boolean;
};
