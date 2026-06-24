import { frontmatterImageFieldNames } from "./frontmatterImageFieldNames";
import { getMarkdownFrontmatterBlock } from "./getMarkdownFrontmatterBlock";

const fieldNames = frontmatterImageFieldNames.join("|");
const frontmatterImageFieldPattern = new RegExp(
  `^(\\s*(?:${fieldNames})\\s*:\\s*)(?:"([^"]+)"|'([^']+)'|([^\\n#]+))(\\s*(?:#.*)?)$`,
  "gm",
);

export function rewriteFrontmatterImageUrls(
  markdown: string,
  replacements: ReadonlyMap<string, string>,
) {
  const frontmatter = getMarkdownFrontmatterBlock(markdown);

  if (!frontmatter) {
    return markdown;
  }

  const rewrittenFrontmatter = frontmatter.content.replace(
    frontmatterImageFieldPattern,
    (
      match,
      prefix: string,
      doubleQuotedUrl: string | undefined,
      singleQuotedUrl: string | undefined,
      bareUrl: string | undefined,
      suffix: string,
    ) => {
      const sourceUrl = (
        doubleQuotedUrl ??
        singleQuotedUrl ??
        bareUrl ??
        ""
      ).trim();
      const replacement = replacements.get(sourceUrl);

      if (!replacement) {
        return match;
      }

      if (doubleQuotedUrl !== undefined) {
        return `${prefix}"${replacement}"${suffix}`;
      }

      if (singleQuotedUrl !== undefined) {
        return `${prefix}'${replacement}'${suffix}`;
      }

      return `${prefix}${replacement}${suffix}`;
    },
  );

  return [
    markdown.slice(0, frontmatter.start),
    rewrittenFrontmatter,
    markdown.slice(frontmatter.end),
  ].join("");
}
