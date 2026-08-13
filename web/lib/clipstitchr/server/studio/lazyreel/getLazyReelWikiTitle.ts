export function getLazyReelWikiTitle(content: string, slug: string) {
  const heading = content
    .split(/\r?\n/u)
    .find((line) => line.startsWith("# "))
    ?.slice(2)
    .trim();

  return heading || slug.replaceAll("-", " ");
}
