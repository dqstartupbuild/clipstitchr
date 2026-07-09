import type { SlashCommandSuggestion } from "../interactiveShell/SlashCommandSuggestion.js";
import { createInteractiveTuiSuggestionCompletionText } from "./createInteractiveTuiSuggestionCompletionText.js";

export function resolveInteractiveTuiCommandSubmission(input: {
  commandText: string;
  suggestion?: SlashCommandSuggestion;
}):
  | { kind: "complete"; commandText: string }
  | { kind: "empty" }
  | { kind: "run"; commandLine: string } {
  const commandLine = input.commandText.trim();

  if (!commandLine || commandLine === "/") {
    return { kind: "empty" };
  }

  if (input.suggestion?.completion === "continue") {
    return {
      kind: "complete",
      commandText: createInteractiveTuiSuggestionCompletionText(
        input.suggestion,
      ),
    };
  }

  return {
    kind: "run",
    commandLine: input.suggestion?.value ?? commandLine,
  };
}
