import { decodeBasicHtmlEntities } from "./decodeBasicHtmlEntities";

function normalizeHeadingText(value: string) {
  return decodeBasicHtmlEntities(value.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function stripRuntimeBlogTitleHeading(html: string, title: string) {
  const match = html.match(/^\s*<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>\s*/i);

  if (!match) {
    return html;
  }

  if (normalizeHeadingText(match[1]) !== normalizeHeadingText(title)) {
    return html;
  }

  return html.slice(match[0].length);
}
