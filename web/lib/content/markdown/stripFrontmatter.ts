export function stripFrontmatter(markdown: string) {
  const normalized = markdown.replace(/^\uFEFF/, "");

  if (!normalized.startsWith("---")) {
    return normalized;
  }

  const closingIndex = normalized.indexOf("\n---", 3);

  if (closingIndex === -1) {
    return normalized;
  }

  const afterClosing = normalized.indexOf("\n", closingIndex + 1);

  if (afterClosing === -1) {
    return "";
  }

  return normalized.slice(afterClosing + 1);
}
