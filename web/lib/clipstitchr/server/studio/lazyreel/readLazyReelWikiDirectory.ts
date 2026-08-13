import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { LazyReelWikiDocument } from "@/lib/clipstitchr/types/lazyreel/LazyReelWikiDocument";
import type { LazyReelWikiDocumentKind } from "@/lib/clipstitchr/types/lazyreel/LazyReelWikiDocumentKind";
import { getLazyReelVendorRoot } from "./getLazyReelVendorRoot";
import { getLazyReelWikiTitle } from "./getLazyReelWikiTitle";

const wikiDirectories: Record<LazyReelWikiDocumentKind, string> = {
  niche: "niches",
  pattern: "patterns",
};

export function readLazyReelWikiDirectory(
  kind: LazyReelWikiDocumentKind,
): LazyReelWikiDocument[] {
  const directoryName = wikiDirectories[kind];
  const directory = join(getLazyReelVendorRoot(), "wiki", directoryName);

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => {
      const slug = basename(entry.name, ".md");
      const content = readFileSync(join(directory, entry.name), "utf8");
      return {
        content,
        kind,
        slug,
        sourcePath: `wiki/${directoryName}/${entry.name}`,
        title: getLazyReelWikiTitle(content, slug),
      };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug));
}
