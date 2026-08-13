import type { LazyReelWikiDocument } from "@/lib/clipstitchr/types/lazyreel/LazyReelWikiDocument";
import { readLazyReelWikiDirectory } from "./readLazyReelWikiDirectory";

let cachedWikiDocuments: LazyReelWikiDocument[] | null = null;

export function listLazyReelWikiDocuments(): LazyReelWikiDocument[] {
  if (!cachedWikiDocuments) {
    cachedWikiDocuments = [
      ...readLazyReelWikiDirectory("niche"),
      ...readLazyReelWikiDirectory("pattern"),
    ];
  }

  return cachedWikiDocuments;
}
