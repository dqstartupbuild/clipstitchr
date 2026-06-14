import { isCliprScriptModeEnabled } from "./isCliprScriptModeEnabled";
import type { AutomationCliprGenerationMode } from "../types/AutomationPreferencesInput";

const automationCliprScriptGenerationModeOption: {
  label: string;
  value: AutomationCliprGenerationMode;
} = { label: "Script", value: "script" };

export const automationCliprGenerationModeOptions: {
  label: string;
  value: AutomationCliprGenerationMode;
}[] = [
  { label: "Any", value: "any" },
  ...(isCliprScriptModeEnabled
    ? [automationCliprScriptGenerationModeOption]
    : []),
  { label: "Reaction", value: "reaction" },
  { label: "B-roll", value: "broll" },
];
