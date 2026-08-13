import type { LazyReelCorpusSnapshot } from "./LazyReelCorpusSnapshot";
import { readLazyReelJsonFile } from "./readLazyReelJsonFile";
import { readLazyReelTrendingTags } from "./readLazyReelTrendingTags";

let cachedSnapshot: LazyReelCorpusSnapshot | null = null;

export function getLazyReelCorpusSnapshot(): LazyReelCorpusSnapshot {
  if (cachedSnapshot) {
    return cachedSnapshot;
  }

  const analyzed = readLazyReelJsonFile<{
    videos?: LazyReelCorpusSnapshot["analyzedVideos"];
  }>("analyzed-videos.json");
  const examples = readLazyReelJsonFile<{
    examples?: LazyReelCorpusSnapshot["examples"];
  }>("examples.json");
  const winners = readLazyReelJsonFile<{
    teardowns?: LazyReelCorpusSnapshot["teardowns"];
  }>("winners.json");
  const trends = readLazyReelJsonFile<{
    trends?: LazyReelCorpusSnapshot["trends"];
  }>("trends.json");

  cachedSnapshot = {
    analyzedVideos: analyzed.videos ?? [],
    appInsights: readLazyReelJsonFile("app-insights.json"),
    breakoutModel: readLazyReelJsonFile("breakout-vs-dud.json"),
    combinations: readLazyReelJsonFile("combo-insights.json"),
    examples: examples.examples ?? [],
    insights: readLazyReelJsonFile("insights.json"),
    stats: readLazyReelJsonFile("corpus-stats.json"),
    teardowns: winners.teardowns ?? [],
    trendingTags: readLazyReelTrendingTags(),
    trends: trends.trends ?? [],
    visualInsights: readLazyReelJsonFile("visual-insights.json"),
    wordInsights: readLazyReelJsonFile("word-insights.json"),
  };

  return cachedSnapshot;
}
