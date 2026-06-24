import { addMarkdownHtmlPlaceholder } from "./addMarkdownHtmlPlaceholder";
import type { MarkdownHtmlPlaceholder } from "./MarkdownHtmlPlaceholder";
import { renderMarkdownImageHtml } from "./renderMarkdownImageHtml";

export function replaceMarkdownImagesWithPlaceholders(
  text: string,
  placeholders: MarkdownHtmlPlaceholder[],
) {
  return text.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (match, alt: string, url: string) => {
      const html = renderMarkdownImageHtml(alt, url);

      if (!html) {
        return match;
      }

      return addMarkdownHtmlPlaceholder(placeholders, html);
    },
  );
}
