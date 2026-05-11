export type CliprHookTemplate = {
  styleKey: string;
  templateId: string;
  template: string;
  requiredVariables: string[];
  emotionalTrigger: string;
  bestFor: string[];
  riskLevel: "safe" | "medium" | "aggressive";
};
