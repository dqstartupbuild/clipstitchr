import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export type HookLibraryQuery = {
  category?: string;
  page: number;
  purpose?: CliprTextPurpose;
  query?: string;
  risk?: CliprHookRiskLevel;
  trigger?: string;
};
