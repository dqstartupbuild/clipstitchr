import type { MarkdownHtmlPlaceholder } from "./MarkdownHtmlPlaceholder";

export function replaceMarkdownHtmlPlaceholders(
  html: string,
  placeholders: MarkdownHtmlPlaceholder[],
) {
  return placeholders.reduce((output, placeholder) => {
    return output.replaceAll(placeholder.placeholder, placeholder.html);
  }, html);
}
