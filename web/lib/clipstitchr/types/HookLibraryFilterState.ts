import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export type HookLibraryFilterState = {
  category: string;
  purpose: "" | CliprTextPurpose;
  query: string;
  risk: "" | CliprHookRiskLevel;
  trigger: string;
};
