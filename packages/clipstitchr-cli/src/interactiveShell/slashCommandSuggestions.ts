import { interactiveCommandDefinitions } from "./interactiveCommandDefinitions.js";
import type { SlashCommandSuggestion } from "./SlashCommandSuggestion.js";

export const slashCommandSuggestions: SlashCommandSuggestion[] =
  interactiveCommandDefinitions.map((definition) => ({
    completion: definition.completion,
    description: definition.description,
    value: definition.value,
  }));
