import { addMarkdownHtmlPlaceholder } from "./addMarkdownHtmlPlaceholder";
import { escapeHtml } from "./escapeHtml";
import type { MarkdownHtmlPlaceholder } from "./MarkdownHtmlPlaceholder";

export function replaceMarkdownCodeSpansWithPlaceholders(
  text: string,
  placeholders: MarkdownHtmlPlaceholder[],
) {
  return text.replace(/`([^`]+)`/g, (_match, code: string) => {
    return addMarkdownHtmlPlaceholder(
      placeholders,
      `<code>${escapeHtml(code)}</code>`,
    );
  });
}
