const markdownImagePattern =
  /(!\[[^\]\n]*(?:\\\][^\]\n]*)*\]\(\s*)(?:<([^>\n]+)>|([^\s)]+))([^)]*\))/g;

export function rewriteMarkdownImageUrls(
  markdown: string,
  replacements: ReadonlyMap<string, string>,
) {
  return markdown.replace(
    markdownImagePattern,
    (match, prefix: string, angleUrl: string | undefined, plainUrl: string | undefined, suffix: string) => {
      const sourceUrl = (angleUrl ?? plainUrl ?? "").trim();
      const replacement = replacements.get(sourceUrl);

      if (!replacement) {
        return match;
      }

      const nextUrl = angleUrl ? `<${replacement}>` : replacement;

      return `${prefix}${nextUrl}${suffix}`;
    },
  );
}
