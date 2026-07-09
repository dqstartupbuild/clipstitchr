import { interactiveCommandDefinitions } from "./interactiveCommandDefinitions.js";
import { normalizeSlashCommandSearchTerm } from "./normalizeSlashCommandSearchTerm.js";
import { scoreInteractiveCommandDefinition } from "./scoreInteractiveCommandDefinition.js";

export function getSlashCommandSuggestionMatches(term: string | undefined) {
  const normalizedTerm = normalizeSlashCommandSearchTerm(term);

  if (!normalizedTerm || normalizedTerm === "/") {
    return interactiveCommandDefinitions.filter(
      (definition) => !definition.value.slice(1).includes(" "),
    );
  }

  const hasTrailingSpace = normalizedTerm.endsWith(" ");
  const query = normalizedTerm.trim();

  return interactiveCommandDefinitions
    .map((definition, index) => ({
      definition,
      index,
      score: scoreInteractiveCommandDefinition({ definition, query }),
    }))
    .filter(
      (match) =>
        match.score > 0 &&
        !(hasTrailingSpace && match.definition.value === query),
    )
    .sort(
      (left, right) =>
        right.score - left.score || left.index - right.index,
    )
    .map((match) => match.definition)
    .slice(0, 12);
}
