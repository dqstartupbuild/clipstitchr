import type { LazyReelStudyVideosData } from "@/lib/clipstitchr/types/lazyreel/LazyReelStudyVideosData";
import type { LazyReelStudyVideosRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelStudyVideosRequest";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { clampLazyReelLimit } from "./clampLazyReelLimit";
import { filterLazyReelExamples } from "./filterLazyReelExamples";
import { findLazyReelNicheKey } from "./findLazyReelNicheKey";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { readLazyReelOptionalText } from "./readLazyReelOptionalText";
import { searchLazyReelAnalyzedVideos } from "./searchLazyReelAnalyzedVideos";

export function executeLazyReelStudyVideos(
  request: LazyReelStudyVideosRequest,
): LazyReelToolResult<LazyReelStudyVideosData> {
  const snapshot = getLazyReelCorpusSnapshot();
  const limit = clampLazyReelLimit(request.limit, 8, 20);
  const query = readLazyReelOptionalText(request.query, 500);
  const niche = readLazyReelOptionalText(request.niche, 200);
  const videoFormat = readLazyReelOptionalText(request.videoFormat, 200);
  const hookPattern = readLazyReelOptionalText(request.hookPattern, 200);
  const examples = filterLazyReelExamples(snapshot.examples, {
    hookPattern,
    niche,
    query,
    videoFormat,
  }).slice(0, limit);
  const corpusQuery = query || [niche, videoFormat, hookPattern].filter(Boolean).join(" ");
  const corpusMatches = corpusQuery
    ? searchLazyReelAnalyzedVideos(snapshot.analyzedVideos, corpusQuery).slice(0, limit)
    : snapshot.analyzedVideos.slice(0, limit);
  const teardownNiche = niche || examples[0]?.niche || "";
  const teardownKey = findLazyReelNicheKey(
    [...new Set(snapshot.teardowns.map((item) => item.niche))],
    teardownNiche,
  );
  const teardowns = teardownKey
    ? snapshot.teardowns.filter((item) => item.niche === teardownKey).slice(0, 3)
    : [];
  const data: LazyReelStudyVideosData = {
    corpusMatches: corpusMatches.map((item) => ({
      engagementTier: item.engagementTier,
      format: item.format,
      framework: item.framework,
      hook: item.hook,
      hookPattern: item.hookPattern,
      id: item.id,
      niche: item.niche,
      signatureDevice: item.signatureDevice,
      whyItWorked: item.whyItWorked,
    })),
    examples,
    filters: {
      hookPattern: hookPattern || null,
      niche: niche || null,
      query: query || null,
      videoFormat: videoFormat || null,
    },
    teardowns: teardowns.map((item) => ({
      hookPattern: item.hookPattern,
      hookTechnique: item.hookTechnique,
      reach: item.reach,
      retentionDevice: item.retentionDevice,
      stealThis: item.stealThis,
      viralMechanism: item.viralMechanism,
    })),
  };

  return {
    data,
    evidence: [
      {
        detail: `${examples.length} matching public link records returned from ${snapshot.examples.length} saved examples.`,
        kind: "observed",
        label: "Public example metadata",
        sample: snapshot.examples.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/examples.json",
      },
      {
        detail: `${teardowns.length} creator-relative breakout diagnoses accompany the matched niche.`,
        kind: "heuristic",
        label: "Editorial diagnosis",
        sample: snapshot.teardowns.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/winners.json",
      },
    ],
    limitations: [
      "Links are returned for the user to open; this engine never downloads, inspects, or verifies the current video page.",
      "Public posts can be removed or edited after the snapshot date.",
      "Views per follower is a creator-relative reach proxy, not a conversion or watch-time measurement.",
    ],
    links: examples.map((example) => ({
      context: `${example.views.toLocaleString()} saved views; ${example.viewsPerFollower}x views per follower; ${example.hookPattern}`,
      label: `${example.niche}: ${example.videoFormat ?? "unclassified format"}`,
      url: example.url,
    })),
    methodology:
      "Filters use non-empty exact-or-contained normalized text matching. Free-text search scores real saved labels, then results are sorted deterministically by views per follower, views, and URL.",
    sections: [
      {
        id: "watch",
        items: examples.map(
          (item) =>
            `${item.viewsPerFollower}x reach; ${item.videoFormat ?? "unclassified"}; ${item.hookPattern}; ${item.emotion ?? "emotion unclassified"}`,
        ),
        title: "Watch these",
      },
      {
        id: "diagnosis",
        items: data.teardowns.map(
          (item) => `${item.reach}: ${item.hookTechnique} Retention: ${item.retentionDevice}`,
        ),
        title: "Why matched breakouts traveled",
      },
      {
        id: "corpus",
        items: data.corpusMatches.map(
          (item) => `${item.hook} (${item.niche}; ${item.format}; ${item.framework})`,
        ),
        title: "Closest analyzed archetypes",
      },
    ],
    summary: examples.length
      ? `${examples.length} saved public examples, ranked by creator-relative reach.`
      : "No saved public examples matched these non-empty filters; broaden the niche, format, hook, or query.",
    title: examples.length ? `${examples.length} videos to study` : "No matching videos",
    tool: "study_videos",
  };
}
