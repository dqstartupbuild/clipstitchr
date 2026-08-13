import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { lazyReelHookPatterns } from "./lazyReelHookPatterns";
import { lazyReelScriptFrameworks } from "./lazyReelScriptFrameworks";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { lazyReelToolDescriptors } from "./lazyReelToolDescriptors";
import { listLazyReelWikiDocuments } from "./listLazyReelWikiDocuments";

export function getLazyReelResearchCatalog(): LazyReelResearchCatalog {
  const snapshot = getLazyReelCorpusSnapshot();
  const formats = new Set<string>();

  snapshot.examples.forEach((example) => {
    if (example.videoFormat) {
      formats.add(example.videoFormat);
    }
  });
  snapshot.analyzedVideos.forEach((video) => formats.add(video.format));

  return {
    counts: {
      analyzedVideos: snapshot.analyzedVideos.length,
      decodedVideosClaimed: snapshot.stats.decodedByPipeline ?? 0,
      exampleLinks: snapshot.examples.length,
      teardowns: snapshot.teardowns.length,
      trendingTags: snapshot.trendingTags.length,
    },
    formats: [...formats].filter(Boolean).sort((left, right) => left.localeCompare(right)),
    frameworks: lazyReelScriptFrameworks.map(({ acronym, bestFor, id, name }) => ({
      acronym,
      bestFor,
      id,
      name,
    })),
    hookPatterns: lazyReelHookPatterns.map(({ id, name }) => ({ id, name })),
    niches: Object.keys(snapshot.insights.byNiche ?? {}).sort((left, right) =>
      left.localeCompare(right),
    ),
    snapshotVersion: lazyReelSnapshotVersion,
    tools: lazyReelToolDescriptors,
    wikiDocuments: listLazyReelWikiDocuments(),
  };
}
