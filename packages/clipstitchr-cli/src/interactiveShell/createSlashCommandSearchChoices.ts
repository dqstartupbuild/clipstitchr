import { getSlashCommandSuggestionMatches } from "./getSlashCommandSuggestionMatches.js";
import { normalizeSlashCommandSearchTerm } from "./normalizeSlashCommandSearchTerm.js";
import type { SlashCommandSearchChoice } from "./SlashCommandSearchChoice.js";

export function createSlashCommandSearchChoices(
  term: string | undefined,
): SlashCommandSearchChoice[] {
  const normalizedTerm = normalizeSlashCommandSearchTerm(term);
  const choices = getSlashCommandSuggestionMatches(term).map((suggestion) => ({
    description: suggestion.description,
    name: suggestion.value,
    value: suggestion.value,
  }));

  if (
    choices.length === 0 &&
    normalizedTerm.startsWith("/") &&
    normalizedTerm.length > 1
  ) {
    choices.push({
      description: "Run exactly what you typed",
      name: normalizedTerm,
      value: normalizedTerm,
    });
  }

  return choices;
}
