import { escapeHtml } from "./escapeHtml";
import { renderInlineMarkdown } from "./renderInlineMarkdown";
import { stripFrontmatter } from "./stripFrontmatter";

const headingPattern = /^(#{1,6})\s+(.*)$/;
const unorderedItemPattern = /^\s*[-*+]\s+(.*)$/;
const orderedItemPattern = /^\s*\d+[.)]\s+(.*)$/;
const blockquotePattern = /^\s*>\s?(.*)$/;
const horizontalRulePattern = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const fencePattern = /^\s*(?:```|~~~)(.*)$/;

function renderParagraph(lines: string[]) {
  const text = lines.join("\n").trim();

  if (!text) {
    return "";
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

    if (line.trim() === "") {
      flushAll();
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
      const inner = renderInlineMarkdown(headingMatch[2].trim());
      blocks.push(`<h${level}>${inner}</h${level}>`);
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
