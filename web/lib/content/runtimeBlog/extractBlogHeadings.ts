import { slugifyHeadingText } from "@/lib/content/markdown/slugifyHeadingText";

export type BlogHeading = {
  id: string;
  text: string;
  level: number;
};

const headingPattern = /<h([2-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

function extractIdFromAttributes(attributeString: string | undefined) {
  if (!attributeString) {
    return null;
  }

  const match = attributeString.match(/\bid\s*=\s*"([^"]+)"/i);

  return match?.[1] ?? null;
}

function extractTextFromInnerHtml(innerHtml: string) {
  return decodeHtmlEntities(innerHtml.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function extractBlogHeadings(html: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  const seenIds = new Map<string, number>();
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(html)) !== null) {
    const level = Number(match[1]);
    const fullTag = match[0];
    const innerHtml = match[2];

    const attributeMatch = fullTag.match(/<h[1-6]([^>]*)>/i);
    const attributes = attributeMatch?.[1];
    const explicitId = extractIdFromAttributes(attributes);
    const text = extractTextFromInnerHtml(innerHtml);

    if (!text) {
      continue;
    }

    const baseId = explicitId ?? slugifyHeadingText(text);
    const fallbackId = baseId || `section-${headings.length + 1}`;

    const duplicateCount = seenIds.get(fallbackId) ?? 0;
    seenIds.set(fallbackId, duplicateCount + 1);

    const id =
      duplicateCount === 0
        ? fallbackId
        : `${fallbackId}-${duplicateCount + 1}`;

    headings.push({ id, text, level });
  }

  return headings;
}
