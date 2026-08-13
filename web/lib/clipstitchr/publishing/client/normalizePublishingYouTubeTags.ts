export function normalizePublishingYouTubeTags(
  tags: readonly string[],
): string[] {
  return tags.map((tag) => tag.trim()).filter(Boolean);
}
