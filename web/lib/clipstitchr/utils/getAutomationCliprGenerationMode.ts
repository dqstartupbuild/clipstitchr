import { automationCliprGenerationModeOptions } from "../constants/automationCliprGenerationModeOptions";
import { defaultAutomationCliprGenerationMode } from "../constants/defaultAutomationCliprGenerationMode";
import type { AutomationCliprGenerationMode } from "../types/AutomationPreferencesInput";

const availableAutomationCliprGenerationModes =
  new Set<AutomationCliprGenerationMode>(
    automationCliprGenerationModeOptions.map((option) => option.value),
  );

export function getAutomationCliprGenerationMode(
  value: unknown,
): AutomationCliprGenerationMode {
  return availableAutomationCliprGenerationModes.has(
    value as AutomationCliprGenerationMode,
  )
    ? (value as AutomationCliprGenerationMode)
    : defaultAutomationCliprGenerationMode;
}
