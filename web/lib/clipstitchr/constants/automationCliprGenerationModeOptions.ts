import { cliprGenerationModeOptions } from "./cliprGenerationModeOptions";
import type { AutomationCliprGenerationMode } from "../types/AutomationPreferencesInput";

export const automationCliprGenerationModeOptions =
  cliprGenerationModeOptions.filter(
    (option): option is {
      label: string;
      value: AutomationCliprGenerationMode;
    } => option.value !== "any" && option.value !== "demo",
  );
