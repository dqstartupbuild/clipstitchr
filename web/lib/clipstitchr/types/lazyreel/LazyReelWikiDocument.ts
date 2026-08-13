import type { LazyReelWikiDocumentKind } from "./LazyReelWikiDocumentKind";

export type LazyReelWikiDocument = {
  content: string;
  kind: LazyReelWikiDocumentKind;
  slug: string;
  sourcePath: string;
  title: string;
};
