export function createUniqueMarkdownHeadingId(
  baseId: string,
  headingIdCounts: Map<string, number>,
) {
  const nextCount = (headingIdCounts.get(baseId) ?? 0) + 1;

  headingIdCounts.set(baseId, nextCount);

  return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
}
