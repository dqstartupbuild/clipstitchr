import type { InteractiveCommandDefinition } from "./InteractiveCommandDefinition.js";
import { getDamerauLevenshteinDistance } from "./getDamerauLevenshteinDistance.js";
import { getInteractiveCommandSearchTokens } from "./getInteractiveCommandSearchTokens.js";

export function scoreInteractiveCommandDefinition(input: {
  definition: InteractiveCommandDefinition;
  query: string;
}) {
  const queryTokens = getInteractiveCommandSearchTokens(input.query);

  if (queryTokens.length === 0) {
    return 0;
  }

  const canonicalTokens = getInteractiveCommandSearchTokens(
    input.definition.value,
  );
  const queryText = queryTokens.join(" ");
  const canonicalText = canonicalTokens.join(" ");
  const searchTexts = (input.definition.searchTerms ?? []).map((term) =>
    getInteractiveCommandSearchTokens(term).join(" "),
  );

  if (canonicalText === queryText) {
    return 1_000;
  }

  if (searchTexts.includes(queryText)) {
    return 950;
  }

  if (canonicalText.startsWith(queryText)) {
    return 900;
  }

  if (searchTexts.some((term) => term.startsWith(queryText))) {
    return 850;
  }

  for (
    let startIndex = 0;
    startIndex <= canonicalTokens.length - queryTokens.length;
    startIndex += 1
  ) {
    const matchesConsecutively = queryTokens.every((queryToken, offset) =>
      canonicalTokens[startIndex + offset]?.startsWith(queryToken),
    );

    if (matchesConsecutively) {
      return 800 - startIndex;
    }
  }

  let orderedIndex = 0;
  let orderedGapCount = 0;

  for (const queryToken of queryTokens) {
    const matchIndex = canonicalTokens.findIndex(
      (candidateToken, index) =>
        index >= orderedIndex && candidateToken.startsWith(queryToken),
    );

    if (matchIndex < 0) {
      orderedIndex = -1;
      break;
    }

    orderedGapCount += matchIndex - orderedIndex;
    orderedIndex = matchIndex + 1;
  }

  if (orderedIndex >= 0) {
    return 700 - orderedGapCount;
  }

  const searchableTokens = [
    ...canonicalTokens,
    ...(input.definition.searchTerms ?? []).flatMap(
      getInteractiveCommandSearchTokens,
    ),
  ];
  const matchesInAnyOrder = queryTokens.every((queryToken) =>
    searchableTokens.some((candidateToken) =>
      candidateToken.startsWith(queryToken),
    ),
  );

  if (matchesInAnyOrder) {
    return 650;
  }

  if (queryTokens.length === 1 && queryTokens[0]!.length >= 4) {
    const maximumDistance = queryTokens[0]!.length >= 8 ? 2 : 1;
    const closestDistance = Math.min(
      ...searchableTokens.map((candidateToken) =>
        getDamerauLevenshteinDistance(queryTokens[0]!, candidateToken),
      ),
    );

    if (closestDistance <= maximumDistance) {
      return 500 - closestDistance;
    }
  }

  return 0;
}
