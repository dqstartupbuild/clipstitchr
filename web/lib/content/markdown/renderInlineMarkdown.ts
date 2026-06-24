import { escapeHtml } from "./escapeHtml";
import { applyInlineMarkdownEmphasis } from "./applyInlineMarkdownEmphasis";
import type { MarkdownHtmlPlaceholder } from "./MarkdownHtmlPlaceholder";
import { replaceMarkdownCodeSpansWithPlaceholders } from "./replaceMarkdownCodeSpansWithPlaceholders";
import { replaceMarkdownHtmlPlaceholders } from "./replaceMarkdownHtmlPlaceholders";
import { replaceMarkdownImagesWithPlaceholders } from "./replaceMarkdownImagesWithPlaceholders";
import { replaceMarkdownLinksWithPlaceholders } from "./replaceMarkdownLinksWithPlaceholders";

export function renderInlineMarkdown(text: string) {
  const placeholders: MarkdownHtmlPlaceholder[] = [];

  let source = replaceMarkdownCodeSpansWithPlaceholders(text, placeholders);
  source = replaceMarkdownImagesWithPlaceholders(source, placeholders);
  source = replaceMarkdownLinksWithPlaceholders(source, placeholders);

  let html = escapeHtml(source);
  html = applyInlineMarkdownEmphasis(html);

  return replaceMarkdownHtmlPlaceholders(html, placeholders);
}
