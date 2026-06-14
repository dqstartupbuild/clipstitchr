import { isCliprScriptModeEnabled } from "./isCliprScriptModeEnabled";
import type { CliprGenerationMode } from "../types/CliprGenerationMode";

const cliprScriptGenerationModeOption: {
  label: string;
  value: CliprGenerationMode;
} = { label: "Script", value: "script" };

export const cliprGenerationModeOptions: {
  label: string;
  value: CliprGenerationMode;
}[] = [
  ...(isCliprScriptModeEnabled ? [cliprScriptGenerationModeOption] : []),
  { label: "Reaction", value: "reaction" },
  { label: "B-roll", value: "broll" },
];
