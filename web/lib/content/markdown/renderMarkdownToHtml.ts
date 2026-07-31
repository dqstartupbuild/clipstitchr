import { escapeHtml } from "./escapeHtml";
import { createUniqueMarkdownHeadingId } from "./createUniqueMarkdownHeadingId";
import { isMarkdownTableDelimiter } from "./isMarkdownTableDelimiter";
import { isMarkdownTableRow } from "./isMarkdownTableRow";
import { parseMarkdownHeadingText } from "./parseMarkdownHeadingText";
import { renderInlineMarkdown } from "./renderInlineMarkdown";
import { renderMarkdownTable } from "./renderMarkdownTable";
import { renderYouTubeEmbedHtml } from "./renderYouTubeEmbedHtml";
import { renderYouTubeIframeBlock } from "./renderYouTubeIframeBlock";
import { slugifyHeadingText } from "./slugifyHeadingText";
import { stripFrontmatter } from "./stripFrontmatter";

const headingPattern = /^(#{1,6})\s+(.*)$/;
const unorderedItemPattern = /^\s*[-*+]\s+(.*)$/;
const orderedItemPattern = /^\s*\d+[.)]\s+(.*)$/;
const blockquotePattern = /^\s*>\s?(.*)$/;
const horizontalRulePattern = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const fencePattern = /^\s*(?:```|~~~)(.*)$/;
const iframeStartPattern = /^\s*<iframe\b/i;
const iframeEndPattern = /<\/iframe\s*>|\/>\s*$/i;

function renderParagraph(lines: string[]) {
  const text = lines.join("\n").trim();

  if (!text) {
    return "";
  }

  const youtubeEmbed = renderYouTubeEmbedHtml(text);

  if (youtubeEmbed) {
    return youtubeEmbed;
  }

  return `<p>${renderInlineMarkdown(text)}</p>`;
}

function renderList(items: string[], ordered: boolean) {
  const renderedItems = items
    .map((item) => `<li>${renderInlineMarkdown(item.trim())}</li>`)
    .join("");
  const tag = ordered ? "ol" : "ul";

  return `<${tag}>${renderedItems}</${tag}>`;
}

function renderBlockquote(lines: string[]) {
  const inner = renderInlineMarkdown(lines.join("\n").trim());

  return `<blockquote><p>${inner}</p></blockquote>`;
}

function renderCodeBlock(lines: string[]) {
  return `<pre><code>${escapeHtml(lines.join("\n"))}</code></pre>`;
}

export function renderMarkdownToHtml(markdown: string) {
  const source = stripFrontmatter(markdown).replace(/\r\n/g, "\n");
  const lines = source.split("\n");

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let quoteLines: string[] = [];
  const headingIdCounts = new Map<string, number>();

  function flushParagraph() {
    if (paragraph.length > 0) {
      const rendered = renderParagraph(paragraph);

      if (rendered) {
        blocks.push(rendered);
      }

      paragraph = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      blocks.push(renderList(listItems, listOrdered));
      listItems = [];
    }
  }

  function flushQuote() {
    if (quoteLines.length > 0) {
      blocks.push(renderBlockquote(quoteLines));
      quoteLines = [];
    }
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = line.match(fencePattern);

    if (fenceMatch) {
      flushAll();

      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !fencePattern.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(renderCodeBlock(codeLines));
      continue;
    }

    if (iframeStartPattern.test(line)) {
      flushAll();

      const iframeLines = [line];

      while (index < lines.length - 1 && !iframeEndPattern.test(lines[index])) {
        index += 1;
        iframeLines.push(lines[index]);
      }

      const youtubeEmbed = renderYouTubeIframeBlock(iframeLines.join("\n"));
      blocks.push(youtubeEmbed ?? renderParagraph(iframeLines));
      continue;
    }

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    if (
      index < lines.length - 1 &&
      isMarkdownTableRow(line) &&
      isMarkdownTableDelimiter(lines[index + 1])
    ) {
      flushAll();

      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length && isMarkdownTableRow(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }

      index -= 1;
      blocks.push(renderMarkdownTable(tableLines));
      continue;
    }

    if (horizontalRulePattern.test(line)) {
      flushAll();
      blocks.push("<hr />");
      continue;
    }

    const headingMatch = line.match(headingPattern);

    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const heading = parseMarkdownHeadingText(headingMatch[2].trim());
      const inner = renderInlineMarkdown(heading.text);
      const explicitId = heading.id;
      const autoId = slugifyHeadingText(heading.text);
      const baseId = explicitId ?? (autoId ? autoId : null);
      const idValue = baseId
        ? createUniqueMarkdownHeadingId(baseId, headingIdCounts)
        : null;
      const id = idValue ? ` id="${escapeHtml(idValue)}"` : "";
      blocks.push(`<h${level}${id}>${inner}</h${level}>`);
      continue;
    }

    const blockquoteMatch = line.match(blockquotePattern);

    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(blockquoteMatch[1]);
      continue;
    }

    const orderedMatch = line.match(orderedItemPattern);

    if (orderedMatch) {
      flushParagraph();
      flushQuote();

      if (!listOrdered) {
        flushList();
        listOrdered = true;
      }

      listItems.push(orderedMatch[1]);
      continue;
    }

    const unorderedMatch = line.match(unorderedItemPattern);

    if (unorderedMatch) {
      flushParagraph();
      flushQuote();

      if (listOrdered) {
        flushList();
        listOrdered = false;
      }

      listItems.push(unorderedMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushAll();

  return blocks.join("\n");
}
