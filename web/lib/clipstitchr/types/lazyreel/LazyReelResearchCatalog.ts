import type { LazyReelToolKey } from "./LazyReelToolKey";
import type { LazyReelWikiDocument } from "./LazyReelWikiDocument";

export type LazyReelResearchCatalog = {
  counts: {
    analyzedVideos: number;
    decodedVideosClaimed: number;
    exampleLinks: number;
    teardowns: number;
    trendingTags: number;
  };
  formats: string[];
  frameworks: Array<{ acronym: string; bestFor: string; id: string; name: string }>;
  hookPatterns: Array<{ id: string; name: string }>;
  niches: string[];
  snapshotVersion: string;
  tools: Array<{ description: string; key: LazyReelToolKey }>;
  wikiDocuments: LazyReelWikiDocument[];
};
