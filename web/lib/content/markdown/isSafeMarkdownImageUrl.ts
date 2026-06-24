export function isSafeMarkdownImageUrl(url: string) {
  const trimmed = url.trim();

  return trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed);
}
