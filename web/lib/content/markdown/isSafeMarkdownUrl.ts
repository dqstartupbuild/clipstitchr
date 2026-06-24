export function isSafeMarkdownUrl(url: string) {
  const trimmed = url.trim();

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return true;
  }

  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}
