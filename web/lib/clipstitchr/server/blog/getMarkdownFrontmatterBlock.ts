import type { MarkdownFrontmatterBlock } from "./MarkdownFrontmatterBlock";

export function getMarkdownFrontmatterBlock(
  markdown: string,
): MarkdownFrontmatterBlock | null {
  const openingFence = markdown.match(/^---\r?\n/);

  if (!openingFence) {
    return null;
  }

  const start = openingFence[0].length;
  const closingFencePattern = /\r?\n---(?:\r?\n|$)/g;

  closingFencePattern.lastIndex = start;

  const closingFence = closingFencePattern.exec(markdown);

  if (!closingFence) {
    return null;
  }

  const end = closingFence.index;

  return {
    content: markdown.slice(start, end),
    start,
    end,
  };
}
