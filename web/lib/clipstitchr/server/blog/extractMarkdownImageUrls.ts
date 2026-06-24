const markdownImagePattern =
  /!\[[^\]\n]*(?:\\\][^\]\n]*)*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))(?:\s+("[^"]*"|'[^']*'))?\s*\)/g;

export function extractMarkdownImageUrls(markdown: string) {
  const urls = new Set<string>();

  for (const match of markdown.matchAll(markdownImagePattern)) {
    const url = (match[1] ?? match[2] ?? "").trim();

    if (url) {
      urls.add(url);
    }
  }

  return Array.from(urls);
}
