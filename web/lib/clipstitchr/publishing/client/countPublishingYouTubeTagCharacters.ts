export function countPublishingYouTubeTagCharacters(
  tags: readonly string[],
): number {
  return tags.reduce(
    (total, tag) => total + tag.length + (/\s/u.test(tag) ? 2 : 0),
    0,
  );
}
