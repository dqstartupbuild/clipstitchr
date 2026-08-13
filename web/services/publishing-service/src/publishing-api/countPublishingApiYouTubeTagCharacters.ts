export const countPublishingApiYouTubeTagCharacters = (
  tags: readonly string[],
): number =>
  tags.reduce(
    (total, tag) => total + tag.length + (/\s/u.test(tag) ? 2 : 0),
    0,
  );
