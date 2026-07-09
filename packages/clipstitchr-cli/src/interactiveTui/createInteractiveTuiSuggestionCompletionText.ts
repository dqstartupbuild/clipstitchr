import type { SlashCommandSuggestion } from "../interactiveShell/SlashCommandSuggestion.js";

export function createInteractiveTuiSuggestionCompletionText(
  suggestion: SlashCommandSuggestion,
) {
  return `${suggestion.value}${suggestion.completion === "continue" ? " " : ""}`;
}
