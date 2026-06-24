import { addMarkdownHtmlPlaceholder } from "./addMarkdownHtmlPlaceholder";
import type { MarkdownHtmlPlaceholder } from "./MarkdownHtmlPlaceholder";
import { renderMarkdownLinkHtml } from "./renderMarkdownLinkHtml";

export function replaceMarkdownLinksWithPlaceholders(
  text: string,
  placeholders: MarkdownHtmlPlaceholder[],
) {
  return text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, label: string, url: string) => {
      const html = renderMarkdownLinkHtml(label, url);

      if (!html) {
        return match;
      }

      return addMarkdownHtmlPlaceholder(placeholders, html);
    },
  );
}
