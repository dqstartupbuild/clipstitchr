import { frontmatterImageFieldNames } from "./frontmatterImageFieldNames";
import { getMarkdownFrontmatterBlock } from "./getMarkdownFrontmatterBlock";

function createFrontmatterImageFieldPattern(fieldName: string) {
  return new RegExp(
    `^\\s*${fieldName}\\s*:\\s*(?:"([^"]+)"|'([^']+)'|([^\\n#]+))`,
    "gm",
  );
}

export function extractFrontmatterImageUrls(markdown: string) {
  const frontmatter = getMarkdownFrontmatterBlock(markdown);

  if (!frontmatter) {
    return [];
  }

  const urls = new Set<string>();

  for (const fieldName of frontmatterImageFieldNames) {
    const pattern = createFrontmatterImageFieldPattern(fieldName);

    for (const match of frontmatter.content.matchAll(pattern)) {
      const url = (match[1] ?? match[2] ?? match[3] ?? "").trim();

      if (url) {
        urls.add(url);
      }
    }
  }

  return Array.from(urls);
}
