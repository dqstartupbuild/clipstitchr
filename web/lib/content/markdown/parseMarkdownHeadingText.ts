import type { MarkdownHeading } from "./MarkdownHeading";

const headingIdPattern = /\s+\{#([a-zA-Z0-9][a-zA-Z0-9_-]*)\}\s*$/;

export function parseMarkdownHeadingText(text: string): MarkdownHeading {
  const match = text.match(headingIdPattern);

  if (!match) {
    return { text };
  }

  return {
    id: match[1],
    text: text.slice(0, match.index).trim(),
  };
}
