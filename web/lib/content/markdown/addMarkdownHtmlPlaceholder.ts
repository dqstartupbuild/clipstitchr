import type { MarkdownHtmlPlaceholder } from "./MarkdownHtmlPlaceholder";

export function addMarkdownHtmlPlaceholder(
  placeholders: MarkdownHtmlPlaceholder[],
  html: string,
) {
  const placeholder = `\u0000HTML${placeholders.length}\u0000`;

  placeholders.push({ html, placeholder });

  return placeholder;
}
