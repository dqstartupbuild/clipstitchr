import type { CliprHookSource } from "@/lib/clipstitchr/types/CliprHookSource";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export type RawCliprHookTemplate = {
  allowedPurposes?: CliprTextPurpose[];
  source?: CliprHookSource;
  styleKey: string;
  template: string;
  templateId: string;
};
