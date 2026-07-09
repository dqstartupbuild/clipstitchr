import { normalizeSlashCommandSearchTerm } from "./normalizeSlashCommandSearchTerm.js";
import { slashCommandSuggestions } from "./slashCommandSuggestions.js";

export function getSlashCommandSuggestionMatches(term: string | undefined) {
  const normalizedTerm = normalizeSlashCommandSearchTerm(term);

  if (!normalizedTerm) {
    return slashCommandSuggestions.filter(
      (suggestion) => !suggestion.value.slice(1).includes(" "),
    );
  }

  const termWithSlash = normalizedTerm.startsWith("/")
    ? normalizedTerm
    : `/${normalizedTerm}`;

  return slashCommandSuggestions
    .filter((suggestion) => suggestion.value.startsWith(termWithSlash))
    .slice(0, 12);
}
