import { cliprGenerationModeOptions } from "@/lib/clipstitchr/constants/cliprGenerationModeOptions";
import type { AutomationCliprGenerationMode } from "@/lib/clipstitchr/types/AutomationPreferencesInput";

export const automationCliprGenerationModeOptions =
  cliprGenerationModeOptions.filter(
    (option): option is {
      label: string;
      value: AutomationCliprGenerationMode;
    } => option.value !== "demo",
  );
